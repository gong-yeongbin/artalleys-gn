interface Location {
  longitude: number;
  latitude: number;
}

interface Image {
  url: string;
}

interface PostData {
  id: number;
  type: string;
  title: string;
  details?: string;
  price:number;
  number:number;
  viewCount: number;
  url: Image[];
  location: Location;
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
