import { Post } from "../entity/Entity";
import { NormalType } from "../types/dataType";
import { replaceHost } from "../../services/util/http";

export class PostBuilder {
  private _data: NormalType;

  constructor(post: Post) {
    this._data = {
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
      url: [post.postImage[0].url],
      location: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
      },
    };
  }

  public replaceHost(newHost: string): PostBuilder {
    this._data.url[0] = replaceHost(this._data.url[0], newHost);
    return this;
  }

  public build() {
    return {
      data: this._data,
    };
  }
}
