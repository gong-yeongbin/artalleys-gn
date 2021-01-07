import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";
import { BusinessFeedType } from "../types/dataType";

export class BusinessFeedBuilder {
  private _data: BusinessFeedType[];
  private _meta: object;

  constructor(post: Post[], metadata: object) {
    this._data = post.map((value, index) => {
      return {
        postId: value.postId,
        title: value.title,
        url: value.postImage[0].url,
      };
    });
  }

  public replaceHost(newHost: string): BusinessFeedBuilder {
    this._data.map((value, index) => {
      this._data[index].url = replaceHost(this._data[index].url, newHost);
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
      _meta: this._meta,
  }
}
