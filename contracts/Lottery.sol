// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Lottery {

    address public manager;
    address[] public players;
    address[] private playersTemp;
    mapping(address => uint) public moneyPlayers;
    mapping(address => bool) public isPlayers;
        
    constructor() {
        manager = payable(msg.sender);
    }

    function enter() public payable {
        require(msg.value > 0.01 ether, "Lottery: not enough money" );
        require(!isPlayers[msg.sender], "Lottery: you already joined the Lottery");
        players.push(payable(msg.sender));
        moneyPlayers[msg.sender] = msg.value;
        isPlayers[msg.sender] = true;        
    }

    function quit() public payable {
        require(isPlayers[msg.sender], "Lottery: you have not entered the Lottery");
        payable(msg.sender).transfer(moneyPlayers[msg.sender]);
        moneyPlayers[msg.sender] = 0; 
        isPlayers[msg.sender] = false;       
                    
        for (uint i; i < players.length; i++) {
            if (players[i] != msg.sender) {
                playersTemp.push(players[i]);
            }
        }
        players = playersTemp;
        playersTemp = new address[](0);               
    }

    function random() public view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }    

    function pickWinner() public payable {
        require(msg.sender == manager, "Loterry: you are not the manager");
        require(players.length > 0, "Lottery: no one join the lottery");
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    function getTotalMoney() public view returns(uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function getNumOfPlayer() public view returns (uint) {
        return players.length;
    }
}