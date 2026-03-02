export type TimelineCursor = {
  createdAt: string;
  tweetId: number;
};

export type TweetRecord = {
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

export type ProfileRecord = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type TimelineResult = {
  tweets: TweetRecord[];
  nextCursor: TimelineCursor | null;
};

export type ProfileWithTweets = {
  profile: ProfileRecord;
  tweets: TweetRecord[];
};
