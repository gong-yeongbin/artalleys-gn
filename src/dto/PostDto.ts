import { Post } from "../entity/Entity";
import { PostData, UserData } from "../types/dataType";
import { replaceHost } from "../../services/util/http";

export class PostBuilder {
  private _data: PostData;
  private _user: UserData;

  constructor(post: Post) {
    this._data = {
      id: post.id,
      title: post.title,
      details: post.details,
      price: post.price,
      number: post.number,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      url: [],
      location: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
      },
      type: post.type.type,
      category: post.category.category,
      condition: post.condition != null ? post.condition.conditions : "",
      status: post.status.status,
      nonNegotiablePriceYn: post.nonNegotiablePriceYn,
    };
    post.image.map((value, index) => {
      post.image[index].url;
      this._data.url.push(post.image[index].url);
    });
    this._user = {
      id: post.user.id,
      nickName: post.user.nickName,
      location: post.user.location != null ? post.user.location : null,
      url: post.user.image != null ? post.user.image.url : null,
    };
  }

  public replaceHost(newHost: string): PostBuilder {
    this._user.url = replaceHost(this._user.url, newHost);
    this._data.url.map((value, index) => {
      this._data.url[index] = replaceHost(this._data.url[index], newHost);
    });
    return this;
  }

  public build() {
    return {
      data: {
        post: this._data,
        user: this._user,
      },
    };
  }
}
