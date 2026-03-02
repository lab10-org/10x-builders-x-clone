export type TimelineCursor = {
  createdAt: string;
  tweetId: number;
};

export type Tweet = {
  id: number;
  authorId: string;
  content: string;
  replyToTweetId: number | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
};
