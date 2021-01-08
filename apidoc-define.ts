/**
 * @apiDefine AuthorizationHeader
 * @apiParam (Header)   {string}    Authorization   Bearer Token
 * @apiParamExample {text}  RequestAuthorized
 * Authorization: Bearer *some_bearer_string*
 */

/**
 * @apiDefine NoContent
 * @apiSuccess (204 No Content) {String}    NoContent  Success
 * @apiSuccessExample {text}    Success
 *      HTTP/1.1    204 No Content
 */

/**
 * @apiDefine ResourceNotFound
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1 404    Not Found
 */

/**
 * @apiDefine Unauthorized
 * @apiError (401 Unauthorized) {String}    message     Unauthorized message
 * @apiErrorExample {json} Unauthorized
 *     HTTP/1.1 401
 *     {
 *         "message": "Unauthorized"
 *     }
 */

/**
 * @apiDefine ValidationError
 * @apiError (400 BadRequest (ValidationError)) {Number=400}    statusCode
 * @apiError (400 BadRequest (ValidationError)) {String}    message
 * @apiError (400 BadRequest (ValidationError)) {String}    datetime
 * @apiErrorExample {json}     InvalidRequest
 *     HTTP/1.1 400
 *     {
 *         "statusCode": 400
 *         "message": "Event object failed validation",
 *         "datetime": "2020-08-10T00:10:10+12:00"
 *     }
 */

/**
 * @apiDefine PresignedResponse
 * @apiSuccess (200 OK) {String}    url             Presigned request Url
 * @apiSuccess (200 OK) {String}    href            Link to the new object if upload is successful
 * @apiSuccess (200 OK) {String}    key             Object key
 * @apiSuccess (200 OK) {Number}    expireInSeconds How long presigned url is valid for (in seconds)
 * @apiSuccessExample {json} SuccessResponse
 *      HTTP/1.1    200 OK
 *      {
 *          "url": "https://staging-compose-user-lkjasf.s3.ap-northeast-2.amazonaws.com/blah",
 *          "href": "https://staging-compose-user-lkjasf.s3.ap-northeast-2.amazonaws.com/objectKey",
 *          "key": "objectKey",
 *          "expireInSeconds": 1800
 *      }
 */

/**
 * @apiDefine PaginationMeta
 * @apiSuccess (200 OK) {Object}               _meta           Metadata container object
 * @apiSuccess (200 OK) {Number}               _meta.total     Total Number of resources
 * @apiSuccess (200 OK) {String=desc,asc}      _meta.order     Order
 * @apiSuccess (200 OK) {Number}               _meta.count     Number of results returned in this request
 * @apiSuccess (200 OK) {Number}               _meta.offset    Offset parameter used in search request
 * @apiSuccess (200 OK) {Number}               _meta.limit     Search result limit parameter
 */

/**
 * @apiDefine PaginationLinks
 * @apiSuccess (200 OK) {Object}                _links              Links container object
 * @apiSuccess (200 OK) {Object}                _links.self         Self link object
 * @apiSuccess (200 OK) {String}                _links.self.href    Self link
 * @apiSuccess (200 OK) {Object}                _links.next         Next link object
 * @apiSuccess (200 OK) {String}                _links.next.href    Next link
 * @apiSuccess (200 OK) {Object}                _links.prev         Prev link object
 * @apiSuccess (200 OK) {String}                _links.prev.href    Prev link
 */
