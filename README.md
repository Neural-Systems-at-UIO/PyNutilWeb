Guide for building and pushing to server

1.  sudo docker build .
2.  sudo docker images
3.  copy the image id of the latest image
4.  Run the following command but replace IMAGEID with the image id you copied in the last step
5.  sudo docker tag IMAGEID docker-registry.ebrains.eu/workbench/pynutilprod:latest     
6.  then you need to login to harbor, to do this you copy your cli secret from ebrains harbor website
7.  then run the following but replace CLISECRET with your clisecret 
8.  echo CLISECRET | sudo docker login -u polarbean --password-stdin docker-registry.ebrains.eu
9.  sudo docker push docker-registry.ebrains.eu/workbench/pynutilprod:latest
     