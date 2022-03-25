// SPDX-License-Identifier: Unidentified
pragma solidity ^0.8.0;

interface Dai {
    function permit(
        address holder,
        address spender,
        uint256 nonce,
        uint256 expiry,
        bool allowed,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

interface ERC20OrderRouter {
    function depositToken(
        uint256 _amount,
        address _module,
        address _inputToken,
        address payable _owner,
        address _witness,
        bytes calldata _data,
        bytes32 _secret
    ) external;
}

contract RelayProxyV1 {
    struct GelatoLimitOrder {
        uint256 _amount;
        address _module;
        address _inputToken;
        address _owner;
        address _witness;
        bytes _data;
        bytes32 _secret;
    }

    struct DaiApprovalPermit {
        address holder;
        address spender;
        uint256 nonce;
        uint256 expiry;
        bool allowed;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function relayLimitOrderWithPermit(
        GelatoLimitOrder memory limitOrderData,
        DaiApprovalPermit memory permit,
        Dai token,
        ERC20OrderRouter router
    ) external {
        // Ignoring all security checks
        // Ignoring all sanitizations
        // Ignoring all pre-approvals
        Dai(token).permit(
            permit.holder,
            permit.spender,
            permit.nonce,
            permit.expiry,
            permit.allowed,
            permit.v,
            permit.r,
            permit.s
        );

        // Approve the router to transfer funds
        Dai(token).approve(address(router), limitOrderData._amount);

        // Transfer funds to this contract
        Dai(token).transferFrom(
            permit.holder,
            address(this),
            limitOrderData._amount
        );

        // After permit
        // Place an order on the erc20 router
        ERC20OrderRouter(router).depositToken(
            limitOrderData._amount,
            limitOrderData._module,
            limitOrderData._inputToken, // should be XDai only
            payable(limitOrderData._owner),
            limitOrderData._witness,
            limitOrderData._data,
            limitOrderData._secret
        );
    }
}
