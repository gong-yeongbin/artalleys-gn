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

interface NormalType extends PostData {
  type: string;
  category: string;
  condition: string;
  number: number;
  price: number;
  active: string;
}

interface BusinessType extends PostData {
  detailTitle?: string;
  address?: string;
  startTime?: number;
  endTime?: number;
  homePage?: string;
  workingHoursDescriptions?: string;
}

export { Location, PostData, BusinessType, NormalType };
