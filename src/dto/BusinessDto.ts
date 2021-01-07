// import { Post } from "../entity/Entity";
// import { BusinessType } from "../types/dataType";
// import { replaceHost } from "../../services/util/http";

// export class BusinessBuilder {
//   private _data: BusinessType;

//   constructor(post: Post) {
//     this._data = {
//       postId: post.postId,
//       title: post.title,
//       view: post.view,
//       detailTitle: post.business.detailTitle,
//       address: post.business.address,
//       startTime: post.business.startTime,
//       endTime: post.business.endTime,
//       homePage: post.business.homepage,
//       workingHoursDescriptions: post.business.workingHoursDescriptions,
//       descriptions: post.business.descriptions,
//       url: [post.postImage[0].url],
//       location: {
//         longitude: post.location.longitude,
//         latitude: post.location.latitude,
//       },
//     };
//   }

//   public replaceHost(newHost: string): BusinessBuilder {
//     this._data.url[0] = replaceHost(this._data.url[0], newHost);
//     return this;
//   }

//   public build() {
//     return {
//       data: this._data,
//     };
//   }
// }
