interface UserData {
  uid: string;
  phoneNumber: string;
  email?: string;
}
interface Location {
  longitude: number;
  latitude: number;
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
  url: string;
  category: string;
  location: Location;
}

export { Location, PostData, BusinessType, FeedData, UserData, PostOtherData };
