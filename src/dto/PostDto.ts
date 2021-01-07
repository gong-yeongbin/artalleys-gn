import { Post } from "../entity/Entity";
import { PostType } from "../types/postType";
import { replaceHost } from "../../services/util/http";

export class PostBuilder {
  private _data: PostType;

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
<<<<<<< Updated upstream
      url: post.postImage[0].url,
=======
      url: [],
>>>>>>> Stashed changes
      location: {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
      },
    };
    post.postImage.map((value, index) => {
      this._data.url.push(post.postImage[index].url);
    });
  }

  public replaceHost(newHost: string): PostBuilder {
<<<<<<< Updated upstream
    this._data.url = replaceHost(this._data.url, newHost);

=======
    this._data.url.map((value, index) => {
      this._data.url[index] = replaceHost(this._data.url[index], newHost);
    });
>>>>>>> Stashed changes
    return this;
  }

  public build() {
    return {
      data: this._data,
    };
  }
}
