import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGameSocket, emitWithAck } from '../services/socketClient.js';

const SESSION_KEY = 'bingo.multiplayer.session.v1';
const MIN_PLAYERS = Number(import.meta.env.VITE_MIN_PLAYERS || 2);
const BOARD_NUMBERS = 25;

// eslint-disable-next-line react-refresh/only-export-components
export const GameContext = createContext(null);

function readSession() {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY);
    const value = saved ? JSON.parse(saved) : null;
    return value?.roomCode && value?.resumeToken && value?.player ? value : null;
  } catch {
    return null;
  }
}

function errorDetails(error) {
  return { code: error?.code || 'UNEXPECTED_ERROR', message: error?.message || 'Something went wrong. Please try again.' };
}

function uniqueNumbers(values) {
  return Array.isArray(values) ? [...new Set(values.filter(Number.isInteger))] : [];
}

function normalizeCard(cardState) {
  if (!cardState?.card || !Array.isArray(cardState.card)) return null;
  const completedLines = Array.isArray(cardState.completedLines) ? cardState.completedLines : [];
  const calledNumbers = uniqueNumbers(cardState.calledNumbers ?? cardState.drawnNumbers);
  const lineCount = Number.isInteger(cardState.lineCount) ? cardState.lineCount : completedLines.length;

  return {
    card: cardState.card,
    markedNumbers: uniqueNumbers(cardState.markedNumbers),
    calledNumbers,
    completedLines,
    lineCount,
    targetLines: Number.isInteger(cardState.targetLines) ? cardState.targetLines : 5,
  };
}

function latestFromRoom(state) {
  const numbers = uniqueNumbers(state?.calledNumbers);
  return numbers.at(-1) || null;
}

export function GameProvider({ children }) {
  const storedSession = useRef(readSession());
  const socketRef = useRef(null);
  const authorizedRef = useRef(false);
  const resumingRef = useRef(false);
  const [session, setSessionState] = useState(storedSession.current);
  const [connection, setConnection] = useState('connecting');
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(storedSession.current?.player || null);
  const [cardState, setCardState] = useState(null);
  const [latestCall, setLatestCall] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const saveSession = useCallback((next) => {
    storedSession.current = next;
    setSessionState(next);
    try {
      if (next) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Session persistence is optional. The active connection remains usable.
    }
  }, []);

  const applyRoom = useCallback((state) => {
    if (!state?.code) return;
    setRoom(state);
    const latest = latestFromRoom(state);
    if (latest) setLatestCall(latest);
  }, []);

  const clearGame = useCallback(({ preserveConnection = true } = {}) => {
    authorizedRef.current = false;
    saveSession(null);
    setRoom(null);
    setPlayer(null);
    setCardState(null);
    setLatestCall(null);
    if (!preserveConnection) setConnection('offline');
  }, [saveSession]);

  const applySessionPayload = useCallback((payload) => {
    if (!payload) return;
    if (payload.state?.code) applyRoom(payload.state);
    if (payload.player?.id) setPlayer(payload.player);
    if (payload.card) {
      const normalized = normalizeCard(payload.card);
      if (normalized) {
        setCardState(normalized);
        if (normalized.calledNumbers.length) setLatestCall(normalized.calledNumbers.at(-1));
      }
    }
    if (payload.resumeToken && payload.roomCode && payload.player) {
      saveSession({ roomCode: payload.roomCode, resumeToken: payload.resumeToken, player: payload.player });
    }
  }, [applyRoom, saveSession]);

  const addCall = useCallback((number) => {
    if (!Number.isInteger(number)) return;
    setLatestCall(number);
    setCardState((previous) => {
      if (!previous || previous.calledNumbers.includes(number)) return previous;
      return { ...previous, calledNumbers: [...previous.calledNumbers, number] };
    });
  }, []);

  const resumeStoredSession = useCallback(async (socket) => {
    const saved = storedSession.current;
    if (!saved || resumingRef.current || socket !== socketRef.current) return;
    resumingRef.current = true;
    setConnection('reconnecting');
    try {
      const data = await emitWithAck(socket, 'player:reconnect', { roomCode: saved.roomCode, resumeToken: saved.resumeToken });
      authorizedRef.current = true;
      applySessionPayload({ ...data, roomCode: saved.roomCode });
      setError(null);
      setFeedback({ tone: 'success', message: 'Your seat has been restored.' });
      setConnection('connected');
    } catch (resumeError) {
      const details = errorDetails(resumeError);
      if (['INVALID_RESUME_TOKEN', 'ROOM_NOT_FOUND', 'INVALID_ROOM_CODE'].includes(details.code)) clearGame();
      setError(details);
      setConnection('error');
    } finally {
      resumingRef.current = false;
    }
  }, [applySessionPayload, clearGame]);

  useEffect(() => {
    const socket = createGameSocket();
    socketRef.current = socket;
    const onConnect = () => {
      if (storedSession.current && !authorizedRef.current) {
        void resumeStoredSession(socket);
        return;
      }
      setConnection('connected');
      setError(null);
    };
    const onDisconnect = (reason) => {
      if (reason === 'io client disconnect') {
        setConnection('disconnected');
        return;
      }
      authorizedRef.current = false;
      setConnection('reconnecting');
    };
    const onConnectError = (connectError) => {
      setConnection('error');
      setError(errorDetails(connectError));
    };
    const onRoomCreated = (data) => {
      authorizedRef.current = true;
      applySessionPayload(data);
    };
    const onRoomJoined = (data) => {
      authorizedRef.current = true;
      applySessionPayload(data);
    };
    const onRoomState = (state) => applyRoom(state);
    const onPlayerJoined = ({ state }) => applyRoom(state);
    const onPlayerLeft = ({ state }) => {
      if (state?.code) applyRoom(state);
    };
    const onGameStarted = ({ state }) => {
      applyRoom(state);
      setLatestCall(null);
    };
    const onCardUpdated = (nextCard) => {
      const normalized = normalizeCard(nextCard);
      if (normalized) {
        setCardState(normalized);
        if (normalized.calledNumbers.length) setLatestCall(normalized.calledNumbers.at(-1));
      }
    };
    const onNumberCalled = ({ number, state }) => {
      applyRoom(state);
      addCall(number);
    };
    const onGameEnded = (ended) => {
      applyRoom(ended.state);
      if (ended.state?.calledNumbers) setLatestCall(latestFromRoom(ended.state));
    };
    const onGameRestarted = ({ state }) => {
      applyRoom(state);
      setCardState(null);
      setLatestCall(null);
      setFeedback({ tone: 'success', message: 'A new round is ready in the lobby.' });
    };
    const onReconnected = (data) => {
      if (data?.card || data?.player?.id === storedSession.current?.player?.id) {
        applySessionPayload({ ...data, roomCode: storedSession.current?.roomCode });
      }
    };
    const onRoomError = (nextError) => setError({ code: nextError?.code || 'SERVER_ERROR', message: nextError?.message || 'The server rejected that action.' });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room:created', onRoomCreated);
    socket.on('room:joined', onRoomJoined);
    socket.on('room:state', onRoomState);
    socket.on('room:player-joined', onPlayerJoined);
    socket.on('room:player-left', onPlayerLeft);
    socket.on('game:started', onGameStarted);
    socket.on('card:updated', onCardUpdated);
    socket.on('game:number-drawn', onNumberCalled);
    socket.on('game:ended', onGameEnded);
    socket.on('game:restarted', onGameRestarted);
    socket.on('player:reconnected', onReconnected);
    socket.on('room:error', onRoomError);
    socket.connect();

    return () => {
      authorizedRef.current = false;
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addCall, applyRoom, applySessionPayload, resumeStoredSession]);

  const waitForConnection = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket) throw Object.assign(new Error('Connecting to the game server...'), { code: 'CONNECTING' });
    if (socket.connected) return socket;
    setConnection('connecting');
    socket.connect();
    await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(Object.assign(new Error('Could not reach the game server.'), { code: 'CONNECTION_LOST' }));
      }, 8000);
      const cleanup = () => {
        window.clearTimeout(timeout);
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
      };
      const onConnect = () => { cleanup(); resolve(); };
      const onConnectError = (reason) => { cleanup(); reject(reason); };
      socket.once('connect', onConnect);
      socket.once('connect_error', onConnectError);
    });
    return socket;
  }, []);

  const runAction = useCallback(async (name, callback) => {
    setPendingAction(name);
    setError(null);
    if (name !== 'restart') setFeedback(null);
    try {
      return await callback();
    } catch (actionError) {
      setError(errorDetails(actionError));
      throw actionError;
    } finally {
      setPendingAction(null);
    }
  }, []);

  const createRoom = useCallback((name) => runAction('create', async () => {
    const socket = await waitForConnection();
    const data = await emitWithAck(socket, 'room:create', { name });
    authorizedRef.current = true;
    applySessionPayload(data);
    return data;
  }), [applySessionPayload, runAction, waitForConnection]);

  const joinRoom = useCallback((roomCode, name) => runAction('join', async () => {
    const socket = await waitForConnection();
    const data = await emitWithAck(socket, 'room:join', { roomCode, name });
    authorizedRef.current = true;
    applySessionPayload(data);
    return data;
  }), [applySessionPayload, runAction, waitForConnection]);

  const startGame = useCallback(() => runAction('start', async () => {
    const socket = await waitForConnection();
    if (!room?.code) throw Object.assign(new Error('No room is active.'), { code: 'ROOM_NOT_FOUND' });
    const data = await emitWithAck(socket, 'game:start', { roomCode: room.code });
    applyRoom(data.state);
    const normalized = normalizeCard(data.card);
    if (normalized) setCardState(normalized);
    setLatestCall(null);
    return data;
  }), [applyRoom, room?.code, runAction, waitForConnection]);

  const callNumber = useCallback((number) => runAction('call', async () => {
    const socket = await waitForConnection();
    if (!room?.code) throw Object.assign(new Error('No room is active.'), { code: 'ROOM_NOT_FOUND' });
    if (!Number.isInteger(number) || number < 1 || number > BOARD_NUMBERS) {
      throw Object.assign(new Error('Choose a number from 1 to 25.'), { code: 'INVALID_NUMBER' });
    }
    const data = await emitWithAck(socket, 'game:draw-request', { roomCode: room.code, number });
    applyRoom(data.state);
    if (Number.isInteger(data.number)) addCall(data.number);
    return data;
  }), [addCall, applyRoom, room?.code, runAction, waitForConnection]);

  const restartGame = useCallback(() => runAction('restart', async () => {
    const socket = await waitForConnection();
    if (!room?.code) throw Object.assign(new Error('No room is active.'), { code: 'ROOM_NOT_FOUND' });
    const data = await emitWithAck(socket, 'game:restart', { roomCode: room.code });
    applyRoom(data.state);
    setCardState(null);
    setLatestCall(null);
    return data;
  }), [applyRoom, room?.code, runAction, waitForConnection]);

  const leaveRoom = useCallback(async () => {
    const code = room?.code || storedSession.current?.roomCode;
    try {
      if (code && socketRef.current?.connected && authorizedRef.current) {
        await emitWithAck(socketRef.current, 'room:leave', { roomCode: code }, 4000);
      }
    } catch {
      // A local exit is still safe if the connection is already gone.
    } finally {
      clearGame();
    }
  }, [clearGame, room?.code]);

  const retryConnection = useCallback(async () => {
    setError(null);
    const socket = await waitForConnection();
    if (storedSession.current && !authorizedRef.current) await resumeStoredSession(socket);
  }, [resumeStoredSession, waitForConnection]);

  const isHost = Boolean(room && player && room.hostId === player.id);
  const calledNumbers = uniqueNumbers(Array.isArray(room?.calledNumbers) ? room.calledNumbers : cardState?.calledNumbers);
  const minimumPlayers = Number.isInteger(room?.minPlayers) ? room.minPlayers : MIN_PLAYERS;
  const placementLimit = Number.isInteger(room?.placementLimit)
    ? room.placementLimit
    : Math.min(3, Number.isInteger(room?.playerCount) ? room.playerCount : 3);
  const targetLines = Number.isInteger(cardState?.targetLines)
    ? cardState.targetLines
    : Number.isInteger(room?.targetLines)
      ? room.targetLines
      : 5;

  const contextValue = useMemo(() => ({
    connection,
    room,
    player,
    cardState,
    calledNumbers,
    latestCall,
    feedback,
    error,
    pendingAction,
    session,
    minimumPlayers,
    placementLimit,
    targetLines,
    isHost,
    isActionPending: (name) => pendingAction === name,
    createRoom,
    joinRoom,
    startGame,
    callNumber,
    restartGame,
    leaveRoom,
    retryConnection,
    clearError: () => setError(null),
  }), [calledNumbers, callNumber, cardState, connection, createRoom, error, feedback, isHost, joinRoom, latestCall, leaveRoom, minimumPlayers, pendingAction, placementLimit, player, restartGame, retryConnection, room, session, startGame, targetLines]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}
