// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );
    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    function balanceOf(address owner) external view returns (uint256 balance);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function approve(address to, uint256 tokenId) external;

    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
}

interface IERC721customs {
    function addrExist(address) external returns (bool);

    function mintNFT(address, string memory) external returns (string memory);
}

///  Main Contract
///  This will interact with other two contracts for minting
///  Addresses for NFT contracts has to be set later after deployment of this contract

contract MAIN {
    event Log(string message);

    address openApe;
    address hammer;
    IERC20 token;
    mapping(address => bool) owners;
    uint256 constant PRICE = 100;

    modifier onlyOwners() {
        require(owners[msg.sender], "You are not added as owner");
        _;
    }

    // params: _owners: ["0xaddr", "0xaddr"]
    constructor(
        address[] memory _owners,
        IERC20 _token,
        address _openApe,
        address _hammer
    ) {
        for (uint8 i = 0; i < _owners.length; ) {
            owners[_owners[i]] = true;
            unchecked {
                i++;
            }
        }
        token = _token;
        openApe = _openApe;
        hammer = _hammer;
    }

    ///  Function will interact with external contract & transfer tokens amount to this contract
    ///  params[in] _to Address to whom NFT will go
    ///  params[in] _tokenURI URI from the IPFS

    function mintHammer(address _to, string memory _tokenURI) public {
        require(
            token.balanceOf(msg.sender) >= PRICE * 10**18,
            "Not Enough Balance To Mint NFT."
        );
        require(
            IERC721customs(openApe).addrExist(_to) != true,
            "You can't mint Hammer as you own Open APE"
        );
        try IERC721customs(hammer).mintNFT(_to, _tokenURI) returns (
            string memory result
        ) {
            token.transferFrom(_to, address(this), PRICE * 10**18);
            emit Log(result);
        } catch {
            emit Log("External call failed");
        }
    }

    function mintOpenApe(address _to, string memory _tokenURI) public {
        require(
            token.balanceOf(msg.sender) >= PRICE * 10**18,
            "Not Enough Balance To Mint NFT."
        );
        require(
            IERC721customs(hammer).addrExist(_to) != true,
            "You can't mint OpenApe as you own Open Hammer"
        );
        try IERC721customs(openApe).mintNFT(_to, _tokenURI) returns (
            string memory result
        ) {
            token.transferFrom(_to, address(this), PRICE * 10**18);
            emit Log(result);
        } catch {
            emit Log("External call failed");
        }
    }

    /// All the NFT minting fees are in contract, which can be withdraw with this function

    function withdraw() public onlyOwners {
        uint256 balance = token.balanceOf(address(this));
        address _to = msg.sender;
        token.transfer(_to, balance);
    }

    function addOwner(address _newOwner) public onlyOwners {
        owners[_newOwner] = true;
    }

    function removeOwner(address _newOwner) public onlyOwners {
        owners[_newOwner] = false;
    }

    function setOpenApeAddress(address _address) public {
        openApe = _address;
    }

    function setHammerAddress(address _address) public {
        hammer = _address;
    }
}
