import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";

interface Location {
  longtitude: number;
  latitude: number;
}

export interface PostData {
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
  url: string[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export class PostBuilder {
  private _postData: PostData;

  constructor(post: Post) {
    const postImage: string[] = [];
    post.postImage.map((value, index) => {
      postImage[index] = value.url;
    });
    const postLocation: Location = {
      longtitude: post.postLocation.longtitude,
      latitude: post.postLocation.latitude,
    };
    const postData: PostData = {
      postId: post.postId,
      type: post.normal.type,
      category: post.normal.category,
      title: post.title,
      descriptions: post.normal.descriptions,
      condition: post.normal.condition,
      view: post.view,
      number: post.number,
      price: post.normal.price,
      active: post.normal.active,
      url: postImage,
      location: postLocation,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    this._postData = postData;
  }

  public replaceHost(newHost: string): PostBuilder {
    this._postData.url.map((value, index) => {
      this._postData.url[index] = replaceHost(
        this._postData.url[index],
        newHost
      );
    });
    return this;
  }

  public build() {
    return this._postData;
  }
}
