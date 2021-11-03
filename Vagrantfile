# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "hashicorp/bionic64"
  config.vm.network "public_network"

  #VM1 tem instalado: prometheus, cadvisor, node exporter, mongoDB, app1, app2, app3

  config.vm.define "linuxVM1" do |linuxVM1|
    linuxVM1.vm.network "private_network", ip: "192.168.1.140"
    linuxVM1.vm.network "forwarded_port", guest: 27017, host: 27017, id: 'mongodb'
    linuxVM1.vm.network "forwarded_port", guest: 8080, host: 8080, id: 'cadvisor1'
    linuxVM1.vm.network "forwarded_port", guest: 9100, host: 9200, id: 'node_exporter1'
    linuxVM1.vm.network "forwarded_port", guest: 9090, host: 9090, id: 'prometheus1'
    linuxVM1.vm.network "forwarded_port", guest: 2050, host: 2050, id: 'app11'
    linuxVM1.vm.provider "virtualbox" do |vb|
      vb.memory = "4096"
      vb.name = "linuxVM1"
    end

    linuxVM1.vm.provision "shell",
    inline: "cd /vagrant/;
    sudo apt-get remove docker docker-engine docker.io containerd runc;
    sudo apt-get update;
    sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release;
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg;
    echo \
    \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null;
    sudo apt-get update;
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io;
    VERSION=v0.36.0;
    sudo docker run \
    --volume=/:/rootfs:ro \
    --volume=/var/run:/var/run:ro \
    --volume=/sys:/sys:ro \
    --volume=/var/lib/docker/:/var/lib/docker:ro \
    --volume=/dev/disk/:/dev/disk:ro \
    --publish=8080:8080 \
    --detach=true \
    --name=cadvisor \
    --privileged \
    --device=/dev/kmsg \
    gcr.io/cadvisor/cadvisor:$VERSION;
    curl -LO https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz;
    tar -xvf node_exporter-0.18.1.linux-amd64.tar.gz;
    sudo mv node_exporter-0.18.1.linux-amd64/node_exporter /usr/local/bin/;
    sudo useradd -rs /bin/false node_exporter;
    cd /vagrant/;
    curl -LO url -LO https://github.com/prometheus/prometheus/releases/download/v2.22.0/prometheus-2.22.0.linux-amd64.tar.gz;
    tar -xvf prometheus-2.22.0.linux-amd64.tar.gz;
    sudo mv prometheus-2.22.0.linux-amd64 prometheus-files;
    sudo useradd --no-create-home --shell /bin/false prometheus;
    sudo mkdir /etc/prometheus;
    sudo mkdir /var/lib/prometheus;
    sudo chown prometheus:prometheus /etc/prometheus;
    sudo chown prometheus:prometheus /var/lib/prometheus;
    sudo cp prometheus-files/prometheus /usr/local/bin/;
    sudo cp prometheus-files/promtool /usr/local/bin/;
    sudo chown prometheus:prometheus /usr/local/bin/prometheus;
    sudo chown prometheus:prometheus /usr/local/bin/promtool;
    sudo cp prometheus-files/prometheus /usr/local/bin/;
    sudo cp prometheus-files/promtool /usr/local/bin/;
    sudo chown prometheus:prometheus /usr/local/bin/prometheus;
    sudo chown prometheus:prometheus /usr/local/bin/promtool;
    sudo cp prometheus.yml /etc/prometheus/;
    sudo chown prometheus:prometheus /etc/prometheus/prometheus.yml;
    sudo rm -rf /var/lib/prometheus/chunks_head/;
    sudo node_exporter > /dev/null 2>&1 &
    sudo prometheus > /dev/null 2>&1 &
    sudo docker build -f Dockerfile.db -t db .;
    sudo docker run -p 27017:27017 -it -d --name db db;
    sudo docker build -f Dockerfile.app1S -t dotnet .;
    sudo docker run -p 2050:2050 -it -d --name dotnet dotnet;
    sudo docker build -f Dockerfile.app2 -t app2 .;
    sudo docker run -p 3000:3000 -it -d --network=host --name app2 app2;
    sudo docker build -f Dockerfile.app3 -t app3 .;
    sudo docker run -p 3001:3001 -it -d --network=host --name app3 app3"

  end


  #VM2 tem instalado: cAdvisor, node exporter, app1
  
  config.vm.define "linuxVM2" do |linuxVM2|
    linuxVM2.vm.network "private_network", ip: "192.168.1.141"
    linuxVM2.vm.network "forwarded_port", guest: 8080, host: 8081, id: 'cadvisor2'
    linuxVM2.vm.network "forwarded_port", guest: 9100, host: 9201, id: 'node_exporter2'
    linuxVM2.vm.network "forwarded_port", guest: 2050, host: 2051, id: 'app12'
    linuxVM2.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
      vb.name = "linuxVM2"
    end

    linuxVM2.vm.provision "shell",
    inline: "cd /vagrant/;
    sudo apt-get remove docker docker-engine docker.io containerd runc;
    sudo apt-get update;
    sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release;
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg;
    echo \
    \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null;
    sudo apt-get update;
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io;
    sudo docker image pull mcr.microsoft.com/dotnet/sdk;
    sudo docker build -f Dockerfile.app1C -t dotnet .;
    sudo docker run -p 2050:2050 -it -d --name dotnet dotnet;
    VERSION=v0.36.0;
    sudo docker run \
    --volume=/:/rootfs:ro \
    --volume=/var/run:/var/run:ro \
    --volume=/sys:/sys:ro \
    --volume=/var/lib/docker/:/var/lib/docker:ro \
    --volume=/dev/disk/:/dev/disk:ro \
    --publish=8080:8080 \
    --detach=true \
    --name=cadvisor \
    --privileged \
    --device=/dev/kmsg \
    gcr.io/cadvisor/cadvisor:$VERSION;
    curl -LO https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz;
    tar -xvf node_exporter-0.18.1.linux-amd64.tar.gz;
    sudo mv node_exporter-0.18.1.linux-amd64/node_exporter /usr/local/bin/;
    sudo useradd -rs /bin/false node_exporter;
    sudo node_exporter > /dev/null 2>&1 &"

  end


  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL
end
