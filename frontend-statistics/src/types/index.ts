export interface User {
  id: number;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface RoomMember {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface Room {
  id: number;
  code: string;
  name: string | null;
  owner: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  memberCount: number;
  members: RoomMember[];
  status: string;
  createdAt: string;
}

