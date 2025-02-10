// Handles rental disputes through decentralized arbitration and resolution mechanisms.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DisputeResolution {
    struct Dispute {
        address tenant;
        address landlord;
        string reason;
        bool resolved;
        address resolver;
        string resolution;
    }

    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCounter;

    event DisputeRaised(uint256 disputeId, address tenant, address landlord, string reason);
    event DisputeResolved(uint256 disputeId, address resolver, string resolution);

    function raiseDispute(address _landlord, string memory _reason) external {
        disputeCounter++;
        disputes[disputeCounter] = Dispute(msg.sender, _landlord, _reason, false, address(0), "");
        emit DisputeRaised(disputeCounter, msg.sender, _landlord, _reason);
    }

    function resolveDispute(uint256 _disputeId, string memory _resolution) external {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.resolved, "Dispute already resolved");

        dispute.resolved = true;
        dispute.resolver = msg.sender;
        dispute.resolution = _resolution;

        emit DisputeResolved(_disputeId, msg.sender, _resolution);
    }
}
