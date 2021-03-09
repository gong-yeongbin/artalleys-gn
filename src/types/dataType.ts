interface Location {
  longitude: number;
  latitude: number;
  city: string;
}
interface UserData {
  id: number;
  uid?: string;
  nickName?: string;
  phoneNumber?: string;
  email?: string;
  url?: string;
}
interface PostData {
  id: number;
  title: string;
  details: string;
  price: number;
  number: number;
  viewCount: number;
  likeCount: number;
  url: string[];
  location: Location;
  type: string;
  category: string;
  condition?: string;
  status: string;
  nonNegotiablePriceYn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostOtherData {
  id: number;
  title: string;
  details: string;
  url: string;
}

interface FeedData {
  id: number;
  title: string;
  status: string;
  category: string;
  price: number;
  url: string;
  likeCount: number;
}

interface BusinessType {
  id: number;
  title: string;
  detailTitle: string;
  address: string;
  number: number;
  startWorkingHours: number;
  endWorkingHours: number;
  businessHoursInfo: string;
  homepage: string;
  details: string;
  url: string[];
  category: string;
  likeCount: number;
  location: Location;
}

interface BusinessFeedData {
  id: number;
  title: string;
  businessHoursInfo: string;
  url: string;
}

interface CommentData {
  id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  commentId?: CommentData;
  user: {
    userId: number;
    nickName: string;
    url: string;
  };
}

interface SignedUrlData {
  key: string;
  url: string;
  href: string;
  expireInSeconds: number;
}

interface NoticeData {
  id: number;
  title: string;
  category: string;
  pushNotification?: boolean;
  publish?: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CsData {
  id: number;
  title: string;
  category: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactCsData {
  id: number;
  content: string;
  answeringQuestions: string;
  user: {
    id: number;
    uid: string;
    nickName: string;
    phoneNumber: string;
    email: string;
  };
}

export {
  Location,
  PostData,
  BusinessType,
  FeedData,
  BusinessFeedData,
  UserData,
  PostOtherData,
  CommentData,
  SignedUrlData,
  NoticeData,
  CsData,
  ContactCsData,
};
