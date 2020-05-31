pragma solidity >=0.4.21 <0.7.0;


contract ValleyToken {
    string public name = "Valley Token";
    string public symbol = "VALLEY";
    string public standard = "Valley Token v1.0";
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer function
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // exception if acc doesn't have enough
        require(balanceOf[msg.sender] >= _value, "Sender not authorized.");
        // Transfer balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;

        // return a boolean
        // tarnsfer event
    }
}
