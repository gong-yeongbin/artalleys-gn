- Run `npm i` command

# serverless framework

- 설치: npm install -g serverless
- 배포: npm run deploy

# 로컬 db 셋팅

- docker 설치

### mysql이미지 다운로드

- docker pull mysql:5.7

### docker mysql 컨테이너 생성 및 실행

- docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password --name mysql_gn mysql

### mysql 컨테이너 접속

- docker exec -i -t mysql_gn bash

### mysql 접속

- mysql -u root -p
- 접속 후 gn 데이터베이스 생성
- 기본 카테고리 및 상태 데이터 > src/migration/V1_Baseline.sql > insert ....
  [erd](https://d19j7dhfxgaxy7.cloudfront.net/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA+2021-03-15+%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE+4.08.23.png)

# apidoc

- apidoc-define.ts 참고
- npm run docs
- docs 폴더 파일 생성
- 배포: s3 > artalleys-gn-apidocs
- 배포url: http://artalleys-gn-apidocs.s3-website.us-east-2.amazonaws.com/
