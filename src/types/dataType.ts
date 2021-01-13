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
  url: string[];
  location: Location;
  type: string;
  category: string;
  condition?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeedData {
  id: number;
  title: string;
  status: string;
  category: string;
  price: number;
  url: string;
}

interface BusinessType extends PostData {
  detailTitle?: string;
  address?: string;
  startTime?: number;
  endTime?: number;
  homePage?: string;
  workingHoursDescriptions?: string;
}

export { Location, PostData, BusinessType, FeedData, UserData };
