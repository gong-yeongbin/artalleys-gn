import { Post } from "../entity/Entity";
import { PostData } from "../types/dataType";
import { replaceHost } from "../../services/util/http";

export class PostBuilder {
  private _data: PostData;

  constructor(post: Post) {
    this._data = {
      id: post.id,
      title: post.title,
      details: post.details,
      price: post.price,
      number: post.number,
      viewCount: post.viewCount,
      url: [],
      location: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
      },
      type: post.type.type,
      category: post.category.category,
      condition: post.condition != null ? post.condition.conditions : "",
      status: post.status.status,
    };
    post.image.map((value, index) => {
      post.image[index].url;
      this._data.url.push(post.image[index].url);
    });
  }

  public replaceHost(newHost: string): PostBuilder {
    this._data.url.map((value, index) => {
      this._data.url[index] = replaceHost(this._data.url[index], newHost);
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
    };
  }
}
