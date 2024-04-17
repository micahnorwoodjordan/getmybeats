from socket import (
    socket, AF_INET,
    SOCK_DGRAM, IPPROTO_UDP, IPPROTO_IP, IP_MULTICAST_TTL
)


group = '224.1.1.1'
port = 5004
group_port_tuple = (group, port)
ttl = 2  # 2-hop network restriction

sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
sock.setsockopt(IPPROTO_IP, IP_MULTICAST_TTL, ttl)

print('sender sending message')
sock.sendto(b'this is a noodle test. give me your noodles', group_port_tuple)
