interface LocationType {
  longitude: number;
  latitude: number;
}

interface PostType {
  postId: string;
  title: string;
  view: number;
  url: string[];
  descriptions?: string;
  location: LocationType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NormalType extends PostType {
  type: string;
  category: string;
  condition: string;
  number: number;
  price: number;
  active: string;
}

interface BusinessType extends PostType {
  detailTitle?: string;
  address?: string;
  startTime?: number;
  endTime?: number;
  homePage?: string;
  workingHoursDescriptions?: string;
}

export { LocationType, PostType, BusinessType, NormalType };
