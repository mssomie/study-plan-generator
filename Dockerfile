FROM aibasel/downward:latest
COPY ./downward /downward
WORKDIR /data
CMD ["--alias", "lama-first"]