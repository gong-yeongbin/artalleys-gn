import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "artalleys-gn",
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
            path: "post/{uid}/createPost",
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
            path: "post/{uid}/{postId}/getPost",
            cors: true,
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
            path: "post/{uid}/createBusiness",
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
            path: "post/{uid}/{postId}/getBusiness",
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
            path: "post/{uid}/{postId}/hidePost",
            cors: true,
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
            path: "post/{uid}/{postId}/boostPost",
            cors: true,
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
            path: "post/{uid}/{postId}/deletePost",
            cors: true,
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
    getCategoryFeed: {
      handler: "services/feed/handler.getCategoryFeed",
      events: [
        {
          http: {
            method: "put",
            path: "feed/getCategoryFeed",
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                },
              },
            },
            cors: true,
          },
        },
      ],
    },
    getSearchFeed: {
      handler: "services/feed/handler.getSearchFeed",
      events: [
        {
          http: {
            method: "put",
            path: "feed/getSearchFeed",
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                },
              },
            },
            cors: true,
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
                  offset: false,
                  limit: false,
                  order: false,
                },
              },
            },
            cors: true,
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
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                  order: false,
                },
              },
            },
            cors: true,
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
            path: "comment/{postId}/{commentId}/getReply",
            request: {
              parameters: {
                querystrings: {
                  offset: false,
                  limit: false,
                  order: false,
                },
              },
            },
            cors: true,
          },
        },
      ],
    },
    // modifyComment: {
    //   handler: "services/comment/handler.modifyComment",
    //   events: [
    //     {
    //       http: {
    //         method: "put",
    //         path: "comment/{commentId}/modifyComment",
    //         cors: true,
    //       },
    //     },
    //   ],
    // },
    // deleteComment: {
    //   handler: "services/comment/handler.deleteComment",
    //   events: [
    //     {
    //       http: {
    //         method: "get",
    //         path: "comment/{commentId}/deleteComment",
    //         cors: true,
    //       },
    //     },
    //   ],
    // },
    imageResize: {
      handler: "services/post/handler.imageResize",
    },
    onConnect: {
      handler: "services/chat-socket/handler.onConnect",
      events: [
        {
          websocket: { route: "$connect" },
        },
      ],
    },
    onDisconnect: {
      handler: "services/chat-socket/handler.onDisconnect",
      events: [{ websocket: { route: "$disconnect" } }],
    },
    onDefault: {
      handler: "services/chat-socket/handler.onDefault",
      events: [
        {
          websocket: { route: "$default" },
        },
      ],
    },
    onSendMessage: {
      handler: "services/chat-socket/handler.onSendMessage",
      events: [
        {
          websocket: { route: "onSendMessage" },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
