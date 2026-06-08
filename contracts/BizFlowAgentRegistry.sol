// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BizFlowAgentRegistry {
    struct Agent {
        string name;
        string capabilities;
        address walletAddress;
        uint256 totalJobs;
        uint256 reputationScore; // scale of 0 to 100
        bool active;
    }

    // Agent ID maps to Agent details
    mapping(string => Agent) private _agents;
    
    // Array of all registered agent IDs
    string[] private _agentIds;

    // Events
    event AgentRegistered(string indexed agentId, string name, string capabilities, address walletAddress);
    event ReputationUpdated(string indexed agentId, uint256 score, uint256 jobId);

    // Register a new agent profile (ERC-8004 inspired identity structure)
    function register(
        string memory agentId,
        string memory name,
        string memory capabilities,
        address walletAddress
    ) public {
        require(bytes(agentId).length > 0, "Agent ID cannot be empty");
        require(walletAddress != address(0), "Invalid wallet address");
        
        if (!_agents[agentId].active) {
            _agentIds.push(agentId);
        }

        _agents[agentId] = Agent({
            name: name,
            capabilities: capabilities,
            walletAddress: walletAddress,
            totalJobs: _agents[agentId].totalJobs,
            reputationScore: _agents[agentId].totalJobs == 0 ? 100 : _agents[agentId].reputationScore,
            active: true
        });

        emit AgentRegistered(agentId, name, capabilities, walletAddress);
    }

    // Update reputation score after job execution
    function updateReputation(
        string memory agentId,
        uint256 score,
        uint256 jobId
    ) public {
        require(_agents[agentId].active, "Agent not registered");
        require(score <= 100, "Score cannot exceed 100");
        
        Agent storage agent = _agents[agentId];
        agent.totalJobs += 1;
        
        // Simple average calculation
        if (agent.totalJobs == 1) {
            agent.reputationScore = score;
        } else {
            agent.reputationScore = (agent.reputationScore * (agent.totalJobs - 1) + score) / agent.totalJobs;
        }

        emit ReputationUpdated(agentId, score, jobId);
    }

    // Retrieve agent details
    function getAgent(string memory agentId)
        public
        view
        returns (
            string memory name,
            string memory capabilities,
            address walletAddress,
            uint256 totalJobs,
            uint256 reputationScore,
            bool active
        )
    {
        Agent memory agent = _agents[agentId];
        return (
            agent.name,
            agent.capabilities,
            agent.walletAddress,
            agent.totalJobs,
            agent.reputationScore,
            agent.active
        );
    }

    // Retrieve list of all registered agent IDs
    function getAllAgentIds() public view returns (string[] memory) {
        return _agentIds;
    }
}
