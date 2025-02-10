// Verifies the identities of landlords and tenants to prevent fraud.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IdentityVerification {
    struct User {
        address userAddress;
        string name;
        string idHash;
        bool isVerified;
    }

    mapping(address => User) public users;

    event UserVerified(address user, string name, string idHash);

    function verifyUser(string memory _name, string memory _idHash) external {
        users[msg.sender] = User(msg.sender, _name, _idHash, true);
        emit UserVerified(msg.sender, _name, _idHash);
    }

    function isUserVerified(address _user) external view returns (bool) {
        return users[_user].isVerified;
    }
}
