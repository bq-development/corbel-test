#!/usr/bin/env bash

DOCKERFILE_EXPOSED_PORTS=(`cat Dockerfile | grep EXPOSE | awk '{printf "%s ", $2}'`)
VM_NAME='default' #changes vm name if it's needed

if [ "$(uname)" == "Darwin" ]; then
    driverName=$(docker-machine inspect $VM_NAME | grep "DriverName" | awk -F '[",]' '{print $4}')

    if [ "$driverName" == "virtualbox" ]; then
        mapped=($(VBoxManage showvminfo $VM_NAME --machinereadable | awk -F '[",]' '/^Forwarding/ { printf("%s\n", $2);}'))
        for i in "${DOCKERFILE_EXPOSED_PORTS[@]}"
        do
            if [ $(echo ${mapped[@]} | grep -o "tcp-port$i" | wc -w) -eq 0 ]; then
                VBoxManage modifyvm "$VM_NAME" --natpf1 "tcp-port$i,tcp,,$i,,$i"
                echo "[INFO] " $i " has been configured in virtualbox"
            else
                echo "[INFO] " $i " is already configured in virtualbox"
            fi

            if [ $(echo ${mapped[@]} | grep -o "udp-port$i" | wc -w) -eq 0 ]; then
                VBoxManage modifyvm "$VM_NAME" --natpf1 "udp-port$i,udp,,$i,,$i"
                echo "[INFO] " $i " has been configured in virtualbox"
            else
                echo "[INFO] " $i " is already configured in virtualbox"
            fi
        done
    else
        echo "[Error] " $driverName " driver is not supported yet!"
    fi
else
    echo "[Error] Your system is not OSX"
fi
