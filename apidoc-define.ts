/**
 * @api {get} /inven/list/:program_id& 상품 조회 API
 * @apiName getInventoryList
 * @apiGroup inven
 * @apiVersion 0.0.0
 * @apiDescription 포인트 등록 화면에서 오른쪽 상품탭에 표시할 아이템을 조회하는 API이다.
 *
 * @apiParam {String} program_id 프로그램의 유니크 아이디
 *
 * @apiParamExample {json} Request-Example:
 *  {
 *      "program_id": "S01_V0000330171",
 *  }
 *
 * @apiSuccessExample {json} Success-Respoonse:
 *  HTTP/1.1 200 OK
 *  {
 *      {
 *          "code": 200,
 *      }
 *  }
 */
