import { S3 } from "aws-sdk";
import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "goodneibors",
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: {
        forceInclude: ["mysql"],
      },
      packager: "npm",
    },
  },
  // Add the serverless-webpack plugin
  plugins: [
    "serverless-webpack",
    "serverless-dotenv-plugin",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    stage: "prod",
    runtime: "nodejs12.x",
    region: "us-east-2",
    websocketsApiRouteSelectionExpression: "$request.body.action",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: {
          "Fn::Join": ["", ["arn:aws:s3:::artalleys-gn-image-bucket", "/*"]],
        },
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: "*",
      },
    ],
  },
  functions: {
    hello: {
      handler: "handler.hello",
      events: [
        {
          http: {
            method: "get",
            path: "hello",
            cors: true,
          },
        },
      ],
    },
    createPost: {
      handler: "services/post/handler.createPost",
      events: [
        {
          http: {
            method: "put",
            path: "post/createPost",
            cors: true,
          },
        },
      ],
    },
    joinUser: {
      handler: "services/user/handler.joinUser",
      events: [
        {
          http: {
            method: "get",
            path: "user/joinUser",
            cors: true,
          },
        },
      ],
    },
    getMySales: {
      handler: "services/user/handler.getMySales",
      events: [
        {
          http: {
            method: "post",
            path: "user/getMySales",
            cors: true,
          },
        },
      ],
    },
    getLocation: {
      handler: "services/user/handler.getLocation",
      events: [
        {
          http: {
            method: "get",
            path: "user/getLocation",
            cors: true,
          },
        },
      ],
    },
    getPost: {
      handler: "services/post/handler.getPost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/getPost",
            cors: true,
          },
        },
      ],
    },
    hidePost: {
      handler: "services/post/handler.hidePost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/hidePost",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    boostPost: {
      handler: "services/post/handler.boostPost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/boostPost",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    deletePost: {
      handler: "services/post/handler.deletePost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/deletePost",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    getOtherPost: {
      handler: "services/post/handler.getOtherPost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/getOtherPost",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    likePost: {
      handler: "services/post/handler.likePost",
      events: [
        {
          http: {
            method: "get",
            path: "post/{postId}/likePost",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    createBusiness: {
      handler: "services/business/handler.createBusiness",
      events: [
        {
          http: {
            method: "put",
            path: "business/createBusiness",
            cors: true,
          },
        },
      ],
    },
    getBusiness: {
      handler: "services/business/handler.getBusiness",
      events: [
        {
          http: {
            method: "get",
            path: "business/{postId}/getBusiness",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    likeBusiness: {
      handler: "services/business/handler.likeBusiness",
      events: [
        {
          http: {
            method: "get",
            path: "business/{postId}/likeBusiness",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    deleteBusiness: {
      handler: "services/business/handler.deleteBusiness",
      events: [
        {
          http: {
            method: "get",
            path: "business/{postId}/deleteBusiness",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    getFeed: {
      handler: "services/feed/handler.getFeed",
      events: [
        {
          http: {
            method: "put",
            path: "feed/getFeed",
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                  order: false,
                  type: false,
                },
              },
            },
            cors: true,
          },
        },
      ],
    },
    modifyComment: {
      handler: "services/comment/handler.modifyComment",
      events: [
        {
          http: {
            method: "put",
            path: "comment/{postId}/modifyComment",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    deleteComment: {
      handler: "services/comment/handler.deleteComment",
      events: [
        {
          http: {
            method: "get",
            path: "comment/{postId}/deleteComment",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    addComment: {
      handler: "services/comment/handler.addComment",
      events: [
        {
          http: {
            method: "put",
            path: "comment/{postId}/addComment",
            cors: true,
            request: {
              parameters: {
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    getComment: {
      handler: "services/comment/handler.getComment",
      events: [
        {
          http: {
            method: "get",
            path: "comment/{postId}/getComment",
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                  order: false,
                },
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    getReply: {
      handler: "services/comment/handler.getReply",
      events: [
        {
          http: {
            method: "get",
            path: "comment/{postId}/getReply",
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                  order: false,
                },
                paths: {
                  postId: true,
                },
              },
            },
          },
        },
      ],
    },
    getBusinessFeed: {
      handler: "services/feed/handler.getBusinessFeed",
      events: [
        {
          http: {
            method: "get",
            path: "feed/getBusinessFeed",
            request: {
              parameters: {
                querystrings: {
                  offset: true,
                  limit: true,
                },
              },
            },
            cors: true,
          },
        },
      ],
    },
    getPostCategory: {
      handler: "services/common/handler.getPostCategory",
      events: [
        {
          http: {
            method: "get",
            path: "common/getPostCategory",
            cors: true,
          },
        },
      ],
    },
    getBusinessCategory: {
      handler: "services/common/handler.getBusinessCategory",
      events: [
        {
          http: {
            method: "get",
            path: "common/getBusinessCategory",
            cors: true,
          },
        },
      ],
    },
    getImageSignedUrl: {
      handler: "services/common/handler.getImageSignedUrl",
      events: [
        {
          http: {
            method: "post",
            path: "common/getImageSignedUrl",
            cors: true,
          },
        },
      ],
    },
    getNotice: {
      handler: "services/common/handler.getNotice",
      events: [
        {
          http: {
            method: "get",
            path: "common/getNotice",
            cors: true,
          },
        },
      ],
    },
    createNotice: {
      handler: "services/cms/handler.createNotice",
      events: [
        {
          http: {
            method: "put",
            path: "cms/notice/createNotice",
            cors: true,
          },
        },
      ],
    },
    modifyNotice: {
      handler: "services/cms/handler.modifyNotice",
      events: [
        {
          http: {
            method: "put",
            path: "cms/notice/{id}/modifyNotice",
            cors: true,
          },
        },
      ],
    },
    deleteNotice: {
      handler: "services/cms/handler.deleteNotice",
      events: [
        {
          http: {
            method: "get",
            path: "cms/notice/{id}/deleteNotice",
            cors: true,
          },
        },
      ],
    },
    getNoticeList: {
      handler: "services/cms/handler.getNoticeList",
      events: [
        {
          http: {
            method: "get",
            path: "cms/notice/getNoticeList",
            cors: true,
          },
        },
      ],
    },
    createCs: {
      handler: "services/cms/handler.createCs",
      events: [
        {
          http: {
            method: "put",
            path: "cms/cs/createCs",
            cors: true,
          },
        },
      ],
    },
    modifyCs: {
      handler: "services/cms/handler.modifyCs",
      events: [
        {
          http: {
            method: "put",
            path: "cms/cs/{id}/modifyCs",
            cors: true,
          },
        },
      ],
    },
    deleteCs: {
      handler: "services/cms/handler.deleteCs",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/{id}/deleteCs",
            cors: true,
          },
        },
      ],
    },
    getCsList: {
      handler: "services/cms/handler.getCsList",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/getCsList",
            cors: true,
          },
        },
      ],
    },
    createContactCs: {
      handler: "services/cms/handler.createContactCs",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/createContactCs",
            cors: true,
          },
        },
      ],
    },
    getContactCs: {
      handler: "services/cms/handler.getContactCs",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/{id}/getContactCs",
            cors: true,
          },
        },
      ],
    },
    contactCsSendAnswer: {
      handler: "services/cms/handler.contactCsSendAnswer",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/{id}/contactCsSendAnswer",
            cors: true,
          },
        },
      ],
    },
    deleteContactCs: {
      handler: "services/cms/handler.deleteContactCs",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/{id}/deleteContactCs",
            cors: true,
          },
        },
      ],
    },
    getContactCsList: {
      handler: "services/cms/handler.getContactCsList",
      events: [
        {
          http: {
            method: "get",
            path: "cms/cs/getContactCsList",
            cors: true,
          },
        },
      ],
    },
    reportPost: {
      handler: "services/report/handler.reportPost",
      events: [
        {
          http: {
            method: "post",
            path: "report/{id}/reportPost",
            cors: true,
          },
        },
      ],
    },
    // onConnect: {
    //   handler: "services/chat-socket/handler.onConnect",
    //   events: [
    //     {
    //       websocket: { route: "$connect" },
    //     },
    //   ],
    // },
    // onConnect2: {
    //   handler: "services/chat-socket/handler.onConnect2",
    //   events: [
    //     {
    //       websocket: { route: "connect2" },
    //     },
    //   ],
    // },
    // onDisconnect: {
    //   handler: "services/chat-socket/handler.onDisconnect",
    //   events: [{ websocket: { route: "$disconnect" } }],
    // },
    // onDefault: {
    //   handler: "services/chat-socket/handler.onDefault",
    //   events: [
    //     {
    //       websocket: { route: "$default" },
    //     },
    //   ],
    // },
    // onSendMessage: {
    //   handler: "services/chat-socket/handler.onSendMessage",
    //   events: [
    //     {
    //       websocket: { route: "onSendMessage" },
    //     },
    //   ],
    // },
    // getChatRoomList: {
    //   handler: "services/chat-socket/handler.getChatRoomList",
    //   events: [
    //     {
    //       http: {
    //         method: "get",
    //         path: "chat/getChatRoomList",
    //         cors: true,
    //       },
    //     },
    //   ],
    // },
    // getChatContentList: {
    //   handler: "services/chat-socket/handler.getChatContentList",
    //   events: [
    //     {
    //       http: {
    //         method: "get",
    //         path: "chat/{receiveId}/getChatContentList",
    //         cors: true,
    //         request: {
    //           parameters: {
    //             querystrings: {
    //               offset: false,
    //               limit: false,
    //             },
    //             paths: {
    //               receiveId: true,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   ],
    // },
  },
};

module.exports = serverlessConfiguration;
