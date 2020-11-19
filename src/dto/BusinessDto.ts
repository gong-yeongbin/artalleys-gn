import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";

export interface BusinessData {
  postId: string;
  title: string;
  url: string;
  view?: number;
  detailTitle?: string;
  address?: string;
  startTime?: number;
  endTime?: number;
  homePage?: string;
  workingHoursDescriptions?: string;
  descriptions?: string;
}

export class BusinessBuilder {
  private _businessData: BusinessData;

  constructor(post: Post) {
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
      url: post.postImage[0].url,
    };

    this._businessData = businessData;
  }

  public replaceHost(newHost: string): BusinessBuilder {
    this._businessData.url = replaceHost(this._businessData.url, newHost);
    return this;
  }

  public build() {
    return this._businessData;
  }
}
