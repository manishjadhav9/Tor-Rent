// Ensures compliance with rental agreements by enforcing penalties for violations.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ContractEnforcement {
    struct Violation {
        address violator;
        string reason;
        uint256 penalty;
        bool enforced;
    }

    mapping(uint256 => Violation) public violations;
    uint256 public violationCounter;

    event ViolationReported(uint256 violationId, address violator, string reason, uint256 penalty);
    event PenaltyEnforced(uint256 violationId, uint256 penalty);

    function reportViolation(address _violator, string memory _reason, uint256 _penalty) external {
        violationCounter++;
        violations[violationCounter] = Violation(_violator, _reason, _penalty, false);
        emit ViolationReported(violationCounter, _violator, _reason, _penalty);
    }

    function enforcePenalty(uint256 _violationId) external {
        Violation storage violation = violations[_violationId];
        require(!violation.enforced, "Penalty already enforced");

        payable(violation.violator).transfer(violation.penalty);
        violation.enforced = true;

        emit PenaltyEnforced(_violationId, violation.penalty);
    }
}
