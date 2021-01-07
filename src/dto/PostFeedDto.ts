import { Post } from "../entity/Entity";
import { replaceHost } from "../../services/util/http";
import { PostFeedType } from "../types/dataType";

export class PostFeedBuilder {
  private _data: PostFeedType[];
  private _meta: object;

  constructor(post: Post[], metadata: object) {
    this._meta = metadata;
    this._data = post.map((value, index) => {
      return {
        postId: value.postId,
        title: value.title,
        view: value.view,
        price: value.normal.price,
        active: value.normal.active,
        url: value.postImage[0].url,
      };
    });
  }

  public replaceHost(newHost: string): PostFeedBuilder {
    this._data.map((value, index) => {
      this._data[index].url = replaceHost(this._data[index].url, newHost);
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
      _meta: this._meta,
    };
  }
}
