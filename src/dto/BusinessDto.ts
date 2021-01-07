// // import { Post } from "../entity/Entity";
// // import { BusinessType } from "../types/dataType";
// // import { replaceHost } from "../../services/util/http";

// // export class BusinessBuilder {
// //   private _data: BusinessType;

// <<<<<<< HEAD
//   constructor(post: Post) {
//     const postImage: string[] = [];
//     post.postImage.map((value, index) => {
//       postImage[index] = value.url;
//     });
//     const postLocation: Location = {
//       longitude: post.location.longitude,
//       latitude: post.location.latitude,
//     };
//     const businessData: BusinessData = {
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
// <<<<<<< Updated upstream
//       url: postImage,
//       location: postLocation,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//     };
// =======
// //   constructor(post: Post) {
// //     this._data = {
// //       postId: post.postId,
// //       title: post.title,
// //       view: post.view,
// //       detailTitle: post.business.detailTitle,
// //       address: post.business.address,
// //       startTime: post.business.startTime,
// //       endTime: post.business.endTime,
// //       homePage: post.business.homepage,
// //       workingHoursDescriptions: post.business.workingHoursDescriptions,
// //       descriptions: post.business.descriptions,
// //       url: [post.postImage[0].url],
// //       location: {
// //         longitude: post.location.longitude,
// //         latitude: post.location.latitude,
// //       },
// //     };
// //   }
// >>>>>>> feature/code_refector

// //   public replaceHost(newHost: string): BusinessBuilder {
// //     this._data.url[0] = replaceHost(this._data.url[0], newHost);
// //     return this;
// //   }

// <<<<<<< HEAD
//   public replaceHost(newHost: string): BusinessBuilder {
//     this._businessData.url.map((value, index) => {
//       this._businessData.url[index] = replaceHost(
//         this._businessData.url[index],
//         newHost
//       );
// =======
//       url: [],
//       location: {
//         longitude: post.location.longitude,
//         latitude: post.location.latitude,
//       },
//     };
//     post.postImage.map((value, index) => {
//       this._data.url.push(post.postImage[index].url);
//     });
//   }

//   public replaceHost(newHost: string): BusinessBuilder {
//     this._data.url.map((value, index) => {
//       this._data.url[index] = replaceHost(this._data.url[index], newHost);
// >>>>>>> Stashed changes
//     });
//     return this;
//   }

//   public build() {
//     return this._businessData;
//   }
// }
// =======
// //   public build() {
// //     return {
// //       data: this._data,
// //     };
// //   }
// // }
// >>>>>>> feature/code_refector
