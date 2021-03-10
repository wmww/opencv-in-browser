FROM trzeci/emscripten:latest

ENV CODE_DIR=/code

RUN mkdir -p $CODE_DIR
WORKDIR $CODE_DIR
ADD . $CODE_DIR
RUN cd $CODE_DIR

RUN ./build_opencv.sh 
