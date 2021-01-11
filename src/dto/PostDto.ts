// import { Post } from "../entity/Entity";
// import { PostData } from "../types/dataType";
// import { replaceHost } from "../../services/util/http";

// export class PostBuilder {
//   private _data: PostData;

//   constructor(post: Post) {
//     this._data = {
//       id: post.id,
//       type: post.type,
//       category: post.category,
//       title: post.title,
//       details: post.details,
//       condition: post.condition,
//       view: post.viewCount,
//       number: post.number,
//       price: post.price,
//       active: post.active,
//       url: [],
//       location: {
//         latitude: post.location.latitude,
//         longitude: post.location.longitude,
//       },
//     };
//     post.image.map((value, index) => {
//       this._data.url.push(post.image[index].url);
//     });
//   }

//   public replaceHost(newHost: string): PostBuilder {
//     this._data.url.map((value, index) => {
//       this._data.url[index] = replaceHost(this._data.url[index], newHost);
//     });
//     return this;
//   }

//   public build() {
//     return {
//       data: this._data,
//     };
//   }
// }
