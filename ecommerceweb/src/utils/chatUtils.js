import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '../configs/firebase';

// Simple ready check for Firestore
const ensureFirebaseReady = async () => {
  console.log('[chatUtils] Ensuring Firebase is ready...');
  
  // Check if db is defined and available
  if (!db) {
    console.error('[chatUtils] Firestore db instance not available');
    throw new Error('Firestore not initialized properly');
  }
  
  try {
    // Ping Firebase to check connection
    const testRef = collection(db, '_connection_test_');
    console.log('[chatUtils] Firebase connection established');
    return Promise.resolve();
  } catch (error) {
    console.error('[chatUtils] Firebase connection error:', error);
    return new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Create or get existing conversation
export const createOrGetConversation = async (currentUserId, otherUserId, otherUserName, otherUserAvatar) => {  
  try {
    console.log('[chatUtils] Creating/getting conversation between', currentUserId, 'and', otherUserId);
    
    // Validate parameters
    if (!currentUserId) throw new Error('currentUserId is required');
    if (!otherUserId) throw new Error('otherUserId is required');
    
    await ensureFirebaseReady();
    
    // Create conversation ID by sorting user IDs to ensure consistency
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    console.log('[chatUtils] Generated conversationId:', conversationId);
    
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Check if conversation exists
    console.log('[chatUtils] Checking if conversation exists...');
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      console.log('[chatUtils] Conversation does not exist, creating new one');
      // Create new conversation with current timestamp
      const now = new Date();
      const conversationData = {
        id: conversationId,
        participants: [
          { 
            id: currentUserId,
            lastSeen: now,
            unreadCount: 0
          },
          { 
            id: otherUserId,
            lastSeen: now,
            unreadCount: 0,
            name: otherUserName,
            avatar: otherUserAvatar
          }
        ],
        participantIds: [currentUserId, otherUserId], // Simple array for queries
        lastMessage: null,
        lastMessageTime: now,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(conversationRef, conversationData);
      console.log('[chatUtils] New conversation created:', conversationId);
    } else {
      console.log('[chatUtils] Conversation already exists:', conversationId);
    }
    
    return conversationId;
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (conversationId, senderId, senderName, senderAvatar, message, messageType = 'text') => {
  try {
    await ensureFirebaseReady();
    
    // Validate required parameters
    if (!conversationId) {
      throw new Error('conversationId is required');
    }
    if (!senderId) {
      throw new Error('senderId is required');
    }
    if (!message) {
      throw new Error('message is required');
    }
    
    console.log(`[sendMessage] Sending message to conversation ${conversationId}:`, {
      senderId,
      senderName,
      message,
      messageType
    });
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    // Use current date instead of serverTimestamp to avoid issues
    const now = new Date();
    
    const messageDoc = await addDoc(messagesRef, {
      text: message,
      senderId: senderId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      messageType: messageType, // 'text', 'image', 'file'
      timestamp: now,
      edited: false,
      editedAt: null,
      reactions: []
    });
    
    console.log(`[sendMessage] Message added with ID: ${messageDoc.id}`);
    
    // Update conversation with last message info
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        text: message,
        senderId: senderId,
        senderName: senderName,
        messageType: messageType,
        timestamp: now
      },
      lastMessageTime: now,
      updatedAt: now
    });
    
    // Update unread count for other participants
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      const updatedParticipants = conversationData.participants.map(participant => {
        if (participant.id !== senderId) {
          return {
            ...participant,
            unreadCount: (participant.unreadCount || 0) + 1
          };
        }
        return participant;
      });
      
      await updateDoc(conversationRef, {
        participants: updatedParticipants
      });
    }
    
    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a conversation with real-time updates
export const subscribeToMessages = async (conversationId, callback) => {
  try {
    // Validate required parameters
    if (!conversationId) {
      console.error('[subscribeToMessages] Missing conversationId');
      throw new Error('conversationId is required');
    }
    if (!callback || typeof callback !== 'function') {
      console.error('[subscribeToMessages] Invalid callback');
      throw new Error('callback is required and must be a function');
    }
    
    console.log(`[subscribeToMessages] Setting up listener for conversation: ${conversationId}`);
    
    await ensureFirebaseReady();
    
    // First, check if the conversation exists
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (!conversationSnap.exists()) {
      console.warn(`[subscribeToMessages] Conversation ${conversationId} does not exist`);
    }
    
    console.log(`[subscribeToMessages] Creating query for messages collection`);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    // Create a simpler query without ordering to avoid potential index issues
    const q = query(messagesRef);
    
    console.log(`[subscribeToMessages] Setting up onSnapshot listener`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[subscribeToMessages] Snapshot received with ${snapshot.size} documents`);
      const messages = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const message = {
          id: doc.id,
          ...data,
          // Safely handle timestamp conversion
          timestamp: data.timestamp ? 
            (typeof data.timestamp.toDate === 'function' ? data.timestamp.toDate() : new Date(data.timestamp)) : 
            new Date()
        };
        messages.push(message);
      });
      
      console.log(`[subscribeToMessages] Processed ${messages.length} messages for conversation ${conversationId}:`, messages);
      
      // Sort messages by timestamp on client side
      messages.sort((a, b) => {
        const timeA = a.timestamp || new Date(0);
        const timeB = b.timestamp || new Date(0);
        return timeA - timeB;
      });
      
      callback(messages);
    }, (error) => {
      console.error(`[subscribeToMessages] Error in listener for ${conversationId}:`, error);
      callback([]); // Return empty array on error
    });
    
    console.log(`[subscribeToMessages] Successfully set up listener for ${conversationId}`);
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Get conversations for a user with real-time updates
export const subscribeToConversations = async (userId, callback) => {
  try {
    // Validate required parameters
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!callback) {
      throw new Error('callback is required');
    }
    
    await ensureFirebaseReady();
    
    const conversationsRef = collection(db, 'conversations');
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      conversationsRef, 
      where('participantIds', 'array-contains', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : 
                           (data.lastMessageTime ? new Date(data.lastMessageTime) : null),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                     (data.createdAt ? new Date(data.createdAt) : null),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                     (data.updatedAt ? new Date(data.updatedAt) : null)
        });
      });
      
      // Sort conversations by lastMessageTime on client side
      conversations.sort((a, b) => {
        const timeA = a.lastMessageTime || a.createdAt || new Date(0);
        const timeB = b.lastMessageTime || b.createdAt || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });
      
      callback(conversations);
    }, (error) => {
      console.error('Error in subscribeToConversations:', error);
      callback([]); // Return empty array on error
    });
  } catch (error) {
    console.error('Error setting up conversation subscription:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Mark conversation as read
export const markConversationAsRead = async (conversationId, userId) => {
  try {
    await ensureFirebaseReady();
    
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data();
      const updatedParticipants = conversationData.participants.map(participant => {
        if (participant.id === userId) {
          return {
            ...participant,
            unreadCount: 0,
            lastSeen: new Date()
          };
        }
        return participant;
      });
      
      await updateDoc(conversationRef, {
        participants: updatedParticipants
      });
    }
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (conversationId, messageId) => {
  try {
    await ensureFirebaseReady();
    
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: new Date()
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Edit a message
export const editMessage = async (conversationId, messageId, newText) => {
  try {
    await ensureFirebaseReady();
    
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      text: newText,
      edited: true,
      editedAt: new Date()
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// Add reaction to message
export const addReaction = async (conversationId, messageId, userId, reaction) => {
  try {
    await ensureFirebaseReady();
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      reactions: arrayUnion({
        userId: userId,
        reaction: reaction,
        timestamp: new Date()
      })
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

// Get user's conversations list
export const getUserConversations = async (userId) => {
  try {
    await ensureFirebaseReady();
    
    const conversationsRef = collection(db, 'conversations');
    // Simplified query
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    const conversations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data,
        lastMessageTime: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : 
                         (data.lastMessageTime ? new Date(data.lastMessageTime) : null),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : 
                   (data.createdAt ? new Date(data.createdAt) : null),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : 
                   (data.updatedAt ? new Date(data.updatedAt) : null)
      });
    });
    
    // Sort by lastMessageTime on client side
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime || a.createdAt || new Date(0);
      const timeB = b.lastMessageTime || b.createdAt || new Date(0);
      return timeB.getTime() - timeA.getTime();
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};
