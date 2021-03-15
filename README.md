- Run `npm i` command

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

3. apidoc 루트 apidoc-define.ts 참고
