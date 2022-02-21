// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";


/// @custom:security-contact contact@TEST
contract $POOP is ERC20, ERC20Burnable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public MAX_SUPPLY = 549600 * (10 ** uint256(decimals()));
    uint256 public TOKENS_SOLD = 0;

    constructor() ERC20("POOP Token", "$POOP") ERC20Permit("POOP Token"){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        mint(0xe88eCC7190c4eF40B325287625e2BdeF18118598, 75000 * (10 ** uint256(decimals())));
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(MAX_SUPPLY > TOKENS_SOLD + amount, "Insufficient supply");
        _mint(to, amount);
        TOKENS_SOLD = TOKENS_SOLD + amount;
    }

    function giveaway(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(MAX_SUPPLY > TOKENS_SOLD + amount, "Insufficient supply");
        _mint(to, amount);
        TOKENS_SOLD = TOKENS_SOLD + amount;
    }
}
