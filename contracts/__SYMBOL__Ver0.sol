/*
                                    SPDX-License-Identifier: MIT

███    ███ ██    ██  ███  ███  ████████  ███   ██   ░████░    ▒████▒   ██    ██  ██   ███  ████████ 
░██▒  ▒██░ ██    ██  ███  ███  ████████  ███   ██   ██████   ▒██████   ██    ██  ██  ▓██   ████████ 
 ███  ███  ██    ██  ███▒▒███  ██        ███▒  ██  ▒██  ██▒  ██▒  ▒█   ██    ██  ██ ▒██▒   ██       
  ██▒▒██   ██    ██  ███▓▓███  ██        ████  ██  ██▒  ▒██  ██        ██    ██  ██░██▒    ██       
  ▓████▓   ██    ██  ██▓██▓██  ██        ██▒█▒ ██  ██    ██  ███▒      ██    ██  █████     ██       
   ████    ██    ██  ██▒██▒██  ███████   ██ ██ ██  ██    ██  ▒█████▒   ██    ██  █████     ███████  
   ▒██▒    ██    ██  ██░██░██  ███████   ██ ██ ██  ██    ██   ░█████▒  ██    ██  █████▒    ███████  
    ██     ██    ██  ██ ██ ██  ██        ██ ▒█▒██  ██    ██      ▒███  ██    ██  ██▒▒██    ██       
    ██     ██    ██  ██    ██  ██        ██  ████  ██▒  ▒██        ██  ██    ██  ██  ██▓   ██       
    ██     ██▓  ▓██  ██    ██  ██        ██  ▒███  ▒██  ██▒  █▒░  ▒██  ██▓  ▓██  ██  ▒██   ██       
    ██     ▒██████▒  ██    ██  ████████  ██   ███   ██████   ███████▒  ▒██████▒  ██   ██▓  ████████ 
    ██      ▒████▒   ██    ██  ████████  ██   ███   ░████░   ░█████▒    ▒████▒   ██   ▒██  ████████ 

                            Copyright 2023 Yumenosuke (Nexum Founder/CTO)
*/

pragma solidity >=0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "erc721psi/contracts/extension/ERC721PsiAddressDataUpgradeable.sol";
import "erc721psi/contracts/extension/ERC721PsiBurnableUpgradeable.sol";
import "operator-filter-registry/src/upgradeable/RevokableDefaultOperatorFiltererUpgradeable.sol";

contract __SYMBOL__Ver0 is
    ERC721PsiAddressDataUpgradeable,
    ERC721PsiBurnableUpgradeable,
    RevokableDefaultOperatorFiltererUpgradeable,
    OwnableUpgradeable,
    IERC2981Upgradeable
{
    using MerkleProofUpgradeable for bytes32[];
    using StringsUpgradeable for uint256;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721Psi_init("$$Token Name$$", "__SYMBOL__");
        __RevokableDefaultOperatorFilterer_init();
        __Ownable_init();

        // set correct values from deploy script!
        baseURI = "/";
        mintLimit = 0;
        publicMintStartTimestamp = 0; // already started
        publicMintEndTimestamp = type(uint256).max; // never ends
        allowlistMintStartTimestamp = 0; // already started
        allowlistMintEndTimestamp = type(uint256).max; // never ends
        publicPrice = 1 ether;
        allowlistPrice = 0.01 ether;
        allowlistedMemberMintLimit = 1;
        highestStage = 0;
        _royaltyFraction = 0;
        _royaltyReceiver = msg.sender;
        _withdrawalReceiver = msg.sender;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721PsiUpgradeable, IERC165Upgradeable) returns (bool) {
        return interfaceId == type(IERC2981Upgradeable).interfaceId || super.supportsInterface(interfaceId);
    }

    function _afterTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override(ERC721PsiAddressDataUpgradeable, ERC721PsiUpgradeable) {
        super._afterTokenTransfers(from, to, startTokenId, quantity);
    }

    function _exists(
        uint256 tokenId
    ) internal view virtual override(ERC721PsiBurnableUpgradeable, ERC721PsiUpgradeable) returns (bool) {
        return super._exists(tokenId);
    }

    function balanceOf(
        address owner_
    ) public view virtual override(ERC721PsiAddressDataUpgradeable, ERC721PsiUpgradeable) returns (uint) {
        return super.balanceOf(owner_);
    }

    function totalSupply()
        public
        view
        virtual
        override(ERC721PsiBurnableUpgradeable, ERC721PsiUpgradeable)
        returns (uint256)
    {
        return super.totalSupply();
    }

    ///////////////////////////////////////////////////////////////////
    //// Ownable
    ///////////////////////////////////////////////////////////////////

    function owner()
        public
        view
        virtual
        override(OwnableUpgradeable, RevokableOperatorFiltererUpgradeable)
        returns (address)
    {
        return OwnableUpgradeable.owner();
    }

    ///////////////////////////////////////////////////////////////////
    //// Apply Operator Filter
    ///////////////////////////////////////////////////////////////////

    function setApprovalForAll(address operator, bool approved) public override onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) public override onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    ///////////////////////////////////////////////////////////////////
    //// ERC2981
    ///////////////////////////////////////////////////////////////////

    uint96 private _royaltyFraction;

    /**
     * @dev set royalty in percentage x 100. e.g. 5% should be 500.
     */
    function setRoyaltyFraction(uint96 royaltyFraction) external onlyOwner {
        _royaltyFraction = royaltyFraction;
    }

    address private _royaltyReceiver;

    function setRoyaltyReceiver(address receiver) external onlyOwner {
        _royaltyReceiver = receiver;
    }

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override checkTokenIdExists(tokenId) returns (address receiver, uint256 royaltyAmount) {
        receiver = _royaltyReceiver;
        royaltyAmount = (salePrice * _royaltyFraction) / 10_000;
    }

    ///////////////////////////////////////////////////////////////////
    //// URI
    ///////////////////////////////////////////////////////////////////

    //////////////////////////////////
    //// Base URI
    //////////////////////////////////

    string public baseURI;

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner checkSuffix(baseURI_, "/") {
        baseURI = baseURI_;
    }

    /**
     * @dev check if the text ends with the suffix.
     */
    modifier checkSuffix(string memory text, bytes1 suffix) {
        bytes memory b = bytes(text);
        require(b.length == 0 || b[b.length - 1] == suffix, "invalid suffix");
        _;
    }

    //////////////////////////////////
    //// Contract URI
    //////////////////////////////////

    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(baseURI, "index.json"));
    }

    //////////////////////////////////
    //// Token URI
    //////////////////////////////////

    function tokenURI(
        uint256 tokenId
    ) public view virtual override checkTokenIdExists(tokenId) returns (string memory) {
        string memory prefix = _keccakPrefixOf(tokenId);
        bytes32 keccak = keccak256(abi.encodePacked(prefix, tokenId.toString()));
        return string(abi.encodePacked(_baseURI(), _toHexString(keccak), ".json"));
    }

    //////////////////////////////////
    //// Keccak Prefix
    //////////////////////////////////

    mapping(uint256 => string) private _stageToKeccakPrefix;

    function _keccakPrefixOf(uint256 tokenId) private view returns (string memory) {
        return _stageToKeccakPrefix[_tokenIdToStage[tokenId]];
    }

    function setKeccakPrefix(uint256 stage, string memory prefix) external onlyOwner {
        _stageToKeccakPrefix[stage] = prefix;
    }

    ///////////////////////////////////////////////////////////////////
    //// Stage (Something like `Reveal`)
    ///////////////////////////////////////////////////////////////////

    uint256 public highestStage;

    function setHighestStage(uint256 highestStage_) external onlyOwner {
        highestStage = highestStage_;
    }

    mapping(uint256 => uint256) private _tokenIdToStage;

    event StageChanged(uint256 tokenId, uint256 stage);

    function stageOf(uint256 tokenId) external view checkTokenIdExists(tokenId) returns (uint256) {
        return _tokenIdToStage[tokenId];
    }

    function _setStage(uint256 tokenId, uint256 stage) private checkTokenIdExists(tokenId) {
        require(stage <= highestStage, "stage: too big number");
        _tokenIdToStage[tokenId] = stage;
        emit StageChanged(tokenId, stage);
    }

    function setStage(uint256 tokenId, uint256 stage) external onlyOwner {
        _setStage(tokenId, stage);
    }

    ///////////////////////////////////////////////////////////////////
    //// Burning Tokens
    ///////////////////////////////////////////////////////////////////

    function burn(uint256 tokenId) public checkTokenIdExists(tokenId) {
        require(ownerOf(tokenId) == msg.sender || owner() == msg.sender);
        _burn(tokenId);
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Tokens
    ///////////////////////////////////////////////////////////////////

    //////////////////////////////////
    //// Admin Mint
    //////////////////////////////////

    function adminMint(uint256 quantity) external onlyOwner checkMintLimit(quantity) {
        _safeMint(msg.sender, quantity);
    }

    function adminMintTo(address to, uint256 quantity) external onlyOwner checkMintLimit(quantity) {
        _safeMint(to, quantity);
    }

    //////////////////////////////////
    //// Public Mint
    //////////////////////////////////

    function publicMint(
        uint256 quantity
    ) external payable whenPublicMintingAvailable checkMintLimit(quantity) checkPay(publicPrice, quantity) {
        _safeMint(msg.sender, quantity);
    }

    //////////////////////////////////
    //// Allowlist Mint
    //////////////////////////////////

    function allowlistMint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    )
        external
        payable
        whenAllowlistMintingAvailable
        checkAllowlist(merkleProof)
        checkAllowlistMintLimit(quantity)
        checkMintLimit(quantity)
        checkPay(allowlistPrice, quantity)
    {
        _incrementAllowlistMemberMintCount(msg.sender, quantity);
        _safeMint(msg.sender, quantity);
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Limit
    ///////////////////////////////////////////////////////////////////

    uint256 public mintLimit;

    function setMintLimit(uint256 _mintLimit) external onlyOwner {
        mintLimit = _mintLimit;
    }

    modifier checkMintLimit(uint256 quantity) {
        require(_totalMinted() + quantity <= mintLimit, "minting exceeds the limit");
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Pricing
    ///////////////////////////////////////////////////////////////////

    modifier checkPay(uint256 price, uint256 quantity) {
        require(msg.value >= price * quantity, "not enough eth");
        _;
    }

    //////////////////////////////////
    //// Public Mint
    //////////////////////////////////

    uint256 public publicPrice;

    function setPublicPrice(uint256 publicPrice_) external onlyOwner {
        publicPrice = publicPrice_;
    }

    //////////////////////////////////
    //// Allowlist Mint
    //////////////////////////////////

    uint256 public allowlistPrice;

    function setAllowlistPrice(uint256 allowlistPrice_) external onlyOwner {
        allowlistPrice = allowlistPrice_;
    }

    ///////////////////////////////////////////////////////////////////
    //// Allowlist
    ///////////////////////////////////////////////////////////////////

    //////////////////////////////////
    //// Verification
    //////////////////////////////////

    bytes32 private _merkleRoot;

    function setAllowlist(bytes32 merkleRoot) external onlyOwner {
        _merkleRoot = merkleRoot;
    }

    function isAllowlisted(bytes32[] calldata merkleProof) public view returns (bool) {
        return merkleProof.verify(_merkleRoot, keccak256(abi.encodePacked(msg.sender)));
    }

    modifier checkAllowlist(bytes32[] calldata merkleProof) {
        require(isAllowlisted(merkleProof), "invalid merkle proof");
        _;
    }

    //////////////////////////////////
    //// Limit
    //////////////////////////////////

    uint256 public allowlistedMemberMintLimit;

    function setAllowlistedMemberMintLimit(uint256 quantity) external onlyOwner {
        allowlistedMemberMintLimit = quantity;
    }

    modifier checkAllowlistMintLimit(uint256 quantity) {
        require(
            allowlistMemberMintCount(msg.sender) + quantity <= allowlistedMemberMintLimit,
            "allowlist minting exceeds the limit"
        );
        _;
    }

    //////////////////////////////////
    //// Aux
    //////////////////////////////////

    uint64 private constant _AUX_BITMASK_ADDRESS_DATA_ENTRY = (1 << 16) - 1;
    uint64 private constant _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED = 0;

    function allowlistMemberMintCount(address owner_) public view returns (uint256) {
        return (_addressData[owner_].aux >> _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED) & _AUX_BITMASK_ADDRESS_DATA_ENTRY;
    }

    function _incrementAllowlistMemberMintCount(address owner_, uint256 quantity) private {
        require(allowlistMemberMintCount(owner_) + quantity <= _AUX_BITMASK_ADDRESS_DATA_ENTRY, "quantity overflow");
        uint64 one = 1;
        uint64 aux = _addressData[owner_].aux + uint64(quantity) * ((one << _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED) | one);
        _addressData[owner_].aux = aux;
    }

    ///////////////////////////////////////////////////////////////////
    //// Minting Period
    ///////////////////////////////////////////////////////////////////

    //////////////////////////////////
    //// Public Mint
    //////////////////////////////////

    event PublicMintAvailablePeriodChanged(uint256 startTimestamp, uint256 endTimestamp);

    /**
     * @notice timestamp to start public minting
     */
    uint256 public publicMintStartTimestamp;

    /**
     * @notice timestamp to end public minting
     */
    uint256 public publicMintEndTimestamp;

    /**
     * @dev set timestamp to start and end public minting
     * @param startTimestamp timestamp to start public minting
     * @param endTimestamp timestamp to end public minting
     */
    function setPublicMintAvailablePeriod(uint256 startTimestamp, uint256 endTimestamp) external onlyOwner {
        publicMintStartTimestamp = startTimestamp;
        publicMintEndTimestamp = endTimestamp;
        emit PublicMintAvailablePeriodChanged(startTimestamp, endTimestamp);
    }

    /**
     * @dev modifier to check if public minting is available
     */
    modifier whenPublicMintingAvailable() {
        require(
            publicMintStartTimestamp <= block.timestamp && block.timestamp <= publicMintEndTimestamp,
            "public minting: not started or ended"
        );
        _;
    }

    //////////////////////////////////
    //// Allowlist Mint
    //////////////////////////////////

    event AllowlistMintAvailablePeriodChanged(uint256 startTimestamp, uint256 endTimestamp);

    /**
     * @notice timestamp to start allowlist minting
     */
    uint256 public allowlistMintStartTimestamp;

    /**
     * @notice timestamp to end allowlist minting
     */
    uint256 public allowlistMintEndTimestamp;

    /**
     * @dev set timestamp to start and end allowlist minting
     * @param startTimestamp timestamp to start allowlist minting
     * @param endTimestamp timestamp to end allowlist minting
     */
    function setAllowlistMintAvailablePeriod(uint256 startTimestamp, uint256 endTimestamp) external onlyOwner {
        allowlistMintStartTimestamp = startTimestamp;
        allowlistMintEndTimestamp = endTimestamp;
        emit AllowlistMintAvailablePeriodChanged(startTimestamp, endTimestamp);
    }

    /**
     * @dev modifier to check if allowlist minting is available
     */
    modifier whenAllowlistMintingAvailable() {
        require(
            allowlistMintStartTimestamp <= block.timestamp && block.timestamp <= allowlistMintEndTimestamp,
            "allowlist minting: not started or ended"
        );
        _;
    }

    ///////////////////////////////////////////////////////////////////
    //// Withdraw
    ///////////////////////////////////////////////////////////////////

    address private _withdrawalReceiver;

    function setWithdrawalReceiver(address receiver) external onlyOwner {
        _withdrawalReceiver = receiver;
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        payable(_withdrawalReceiver).transfer(amount);
    }

    ///////////////////////////////////////////////////////////////////
    //// Utilities
    ///////////////////////////////////////////////////////////////////

    modifier checkTokenIdExists(uint256 tokenId) {
        require(_exists(tokenId), "tokenId not exist");
        _;
    }

    function _toHexString(bytes32 data) private pure returns (string memory) {
        uint256 k = uint256(data);
        bytes16 symbols = "0123456789abcdef";
        uint256 length = data.length * 2;
        bytes memory result = new bytes(length);
        for (uint256 i = 1; i <= length; i++ + (k >>= 4)) result[length - i] = symbols[k & 0xf];
        return string(result);
    }
}
