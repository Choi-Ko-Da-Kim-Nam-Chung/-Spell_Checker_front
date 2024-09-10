# Node.js 기반 이미지를 사용
FROM node:16-alpine

# 앱 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 모든 소스 파일 복사
COPY . .

# 프로젝트 빌드
RUN npm run build

# serve 패키지를 글로벌로 설치
RUN npm install -g serve

# 컨테이너에서 사용할 포트 번호
EXPOSE 3000

# serve를 사용해 build 디렉토리를 서빙
CMD ["serve", "-s", "build", "-l", "3000"]
