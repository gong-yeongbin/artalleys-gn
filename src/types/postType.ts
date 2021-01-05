interface LocationType {
  longitude: number;
  latitude: number;
}

interface PostType {
  postId: string;
  type: string;
  category: string;
  title: string;
  descriptions: string;
  condition: string;
  view: number;
  number: number;
  price: number;
  active: string;
  url: string;
  location: LocationType;
  createdAt?: Date;
  updatedAt?: Date;
}

export { LocationType, PostType };
