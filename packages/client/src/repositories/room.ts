import { roomReference } from '@/core/useFirestoreReference'
import { firestore } from '@/plugins/firebase'
import { getUser } from '@/repositories/public'
import { user } from '@/store'
import { PrivateRoom, PublicRoom, Room } from '@/types/core'
import { getTimestamp, getTimestamps } from '@/utils/firestore'
import { generateRandomB64 } from '@/utils/secret'

export const createRoom = () => {
  const { collectionRef } = roomReference()

  const room: Room = {
    isPrivate: false,
    members: [user.id],
    recent: {
      message: 'No messages',
      isAnonymous: true,
      ...getTimestamps()
    },
    name: 'New Room',
    photoURL: '',
    ...getTimestamps()
  }

  return collectionRef.value.add(room)
}

type Options = {
  name: string
  photoURL: string
}
export const createPublicRoom = (options: Options) => {
  const { name, photoURL } = options
  const { collectionRef } = roomReference()

  const room: PublicRoom = {
    isPrivate: false,
    name,
    members: [],
    messageCount: 0,
    photoURL,
    recent: {
      shortMessage: 'No messages',
      kind: 'TEXT',
      author: {
        isAnonymous: true
      },
      ...getTimestamps()
    },
    ...getTimestamps()
  }
  return collectionRef.value.add(room)
}

export const createPrivateRoom = () => {
  const { collectionRef } = roomReference()
  const key = generateRandomB64()

  const room: PrivateRoom = {
    isPrivate: true,
    key,
    members: [user.id],
    recent: {
      shortMessage: 'No messages',
      kind: 'TEXT',
      author: {
        isAnonymous: true
      },
      ...getTimestamps()
    },
    messageCount: 0,
    name: 'New Room',
    photoURL: '',
    ...getTimestamps()
  }

  return collectionRef.value.add(room)
}

export const existsDoc = async (documentPath: string): Promise<boolean> => {
  const { exists } = await firestore.doc(documentPath).get()

  return exists
}

export const joinRoom = (doc: string, isHost: boolean = false) => {
  const { displayName, photoURL, id } = user

  firestore
    .collection('rooms')
    .doc(doc)
    .collection('members')
    .doc(id)
    .set({
      id,
      displayName,
      photoURL,
      isHost
    })
}

export const updateRoom = () => {
  const u = getUser(user.id)
  const { documentRef } = roomReference()

  return documentRef.value.update({
    ...u,
    ...getTimestamp('updatedAt')
  })
}

export const getRoomKey = async (id: string) => {
  const { collectionRef } = roomReference()
  const documentData = await collectionRef.value.doc(id).get()
  // return collectionRef.value.doc(id).get()
  const data = documentData.data()
  return data ? (data.key as string) : ''
}

export const updateRecent = (message: string) => {
  const { documentRef } = roomReference()

  return documentRef.value.update({
    recent: {
      message,
      ...getUser(user.id),
      ...getTimestamp('updatedAt')
    }
  })
}
