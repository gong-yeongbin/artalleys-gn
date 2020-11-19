import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";
interface Location {
  longtitude: number;
  latitude: number;
}
export interface BusinessData {
  postId: string;
  title: string;
  view?: number;
  detailTitle?: string;
  address?: string;
  startTime?: number;
  endTime?: number;
  homePage?: string;
  workingHoursDescriptions?: string;
  descriptions?: string;
  url: string[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export class BusinessBuilder {
  private _businessData: BusinessData;

  constructor(post: Post) {
    const postImage: string[] = [];
    post.postImage.map((value, index) => {
      postImage[index] = value.url;
    });
    const postLocation: Location = {
      longtitude: post.postLocation.longtitude,
      latitude: post.postLocation.latitude,
    };
    const businessData: BusinessData = {
      postId: post.postId,
      title: post.title,
      view: post.view,
      detailTitle: post.business.detailTitle,
      address: post.business.address,
      startTime: post.business.startTime,
      endTime: post.business.endTime,
      homePage: post.business.homepage,
      workingHoursDescriptions: post.business.workingHoursDescriptions,
      descriptions: post.business.descriptions,
      url: postImage,
      location: postLocation,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    this._businessData = businessData;
  }

  public replaceHost(newHost: string): BusinessBuilder {
    this._businessData.url.map((value, index) => {
      this._businessData.url[index] = replaceHost(
        this._businessData.url[index],
        newHost
      );
    });
    return this;
  }

  public build() {
    return this._businessData;
  }
}
