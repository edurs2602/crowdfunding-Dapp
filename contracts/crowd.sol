pragma solidity ^0.8.3;

contract Crowdfunding {
    address public owner;
    mapping(address => uint256) public contribuitors;

    uint256 public deadline;
    uint256 public value;
    uint256 public raisedValue;

    uint256 public timenow = block.timestamp / 1 days;

    struct Crowd {
        address payable recipient;
        uint256 crowdValue;
        bool finished;
    }

    mapping(uint256 => Crowd) public crowds;
    uint256 public numCrowds;

    constructor(uint256 _deadline) {
        deadline = timenow + _deadline;
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "modifier error");
        _;
    }

    function contribute(uint256 amount) public payable {
        require(timenow < deadline, "it's over");
        require(msg.sender != owner, "you can't send to yourself");
        require(contribuitors[msg.sender] < amount, "insufficient funds");

        contribuitors[msg.sender] += amount;
        raisedValue += amount;
    }

    function createCrowd(address payable _recipient, uint256 _crowdValue)
        public
        restricted
    {
        Crowd storage newCrowd = crowds[numCrowds];
        numCrowds++;
        newCrowd.recipient = _recipient;
        newCrowd.crowdValue = _crowdValue;
        newCrowd.finished = false;

        value = _crowdValue;
    }

    function withdraw() public restricted {
        require(raisedValue >= value, "unbeaten goal");
        payable(owner).transfer(address(this).balance);
    }

    function getDeadline() public view returns (uint256) {
        uint256 deadlineInDays = deadline - timenow;
        return deadlineInDays;
    }

    function getRaisedFunds() public view returns (uint256) {
        return raisedValue;
    }

    function getTarget() public view returns (uint256) {
        return value;
    }

    function isOwner() public view returns (bool) {
        if (msg.sender == owner) {
            return true;
        } else {
            return false;
        }
    }
}
