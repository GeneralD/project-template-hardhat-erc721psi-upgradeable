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

contract __SYMBOL__Ver0 is
    ERC721PsiAddressDataUpgradeable,
    ERC721PsiBurnableUpgradeable,
    OwnableUpgradeable,
    IERC2981Upgradeable
{
    using MerkleProofUpgradeable for bytes32[];
    using StringsUpgradeable for uint256;

    function initialize() public initializer {
        __ERC721Psi_init("$$Token Name$$", "__SYMBOL__");
        __Ownable_init();

        // set correct values from deploy script!
        baseURI = "/";
        mintLimit = 0;
        isPublicMintPaused = true;
        isAllowlistMintPaused = true;
        publicPrice = 1 ether;
        allowListPrice = 0.01 ether;
        allowlistedMemberMintLimit = 1;
        highestStage = 0;
        _royaltyFraction = 0;
        _royaltyReceiver = msg.sender;
        _withdrawalReceiver = msg.sender;
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
        address owner
    ) public view virtual override(ERC721PsiAddressDataUpgradeable, ERC721PsiUpgradeable) returns (uint) {
        return super.balanceOf(owner);
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

    function setBaseURI(string memory baseURI_) external onlyOwner {
        baseURI = baseURI_;
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
    ) external payable whenPublicMintNotPaused checkMintLimit(quantity) checkPay(publicPrice, quantity) {
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
        whenAllowlistMintNotPaused
        checkAllowlist(merkleProof)
        checkAllowlistMintLimit(quantity)
        checkMintLimit(quantity)
        checkPay(allowListPrice, quantity)
    {
        _incrementAllowListMemberMintCount(msg.sender, quantity);
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

    uint256 public allowListPrice;

    function setAllowListPrice(uint256 allowListPrice_) external onlyOwner {
        allowListPrice = allowListPrice_;
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
            allowListMemberMintCount(msg.sender) + quantity <= allowlistedMemberMintLimit,
            "allowlist minting exceeds the limit"
        );
        _;
    }

    //////////////////////////////////
    //// Aux
    //////////////////////////////////

    uint64 private constant _AUX_BITMASK_ADDRESS_DATA_ENTRY = (1 << 16) - 1;
    uint64 private constant _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED = 0;

    function allowListMemberMintCount(address owner) public view returns (uint256) {
        return (_addressData[owner].aux >> _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED) & _AUX_BITMASK_ADDRESS_DATA_ENTRY;
    }

    function _incrementAllowListMemberMintCount(address owner, uint256 quantity) private {
        require(allowListMemberMintCount(owner) + quantity <= _AUX_BITMASK_ADDRESS_DATA_ENTRY, "quantity overflow");
        uint64 one = 1;
        uint64 aux = _addressData[owner].aux + uint64(quantity) * ((one << _AUX_BITPOS_NUMBER_ALLOWLIST_MINTED) | one);
        _addressData[owner].aux = aux;
    }

    ///////////////////////////////////////////////////////////////////
    //// Pausing
    ///////////////////////////////////////////////////////////////////

    event PublicMintPaused();
    event PublicMintUnpaused();
    event AllowlistMintPaused();
    event AllowlistMintUnpaused();

    //////////////////////////////////
    //// Public Mint
    //////////////////////////////////

    bool public isPublicMintPaused;

    function pausePublicMint() external onlyOwner whenPublicMintNotPaused {
        isPublicMintPaused = true;
        emit PublicMintPaused();
    }

    function unpausePublicMint() external onlyOwner whenPublicMintPaused {
        isPublicMintPaused = false;
        emit PublicMintUnpaused();
    }

    modifier whenPublicMintNotPaused() {
        require(!isPublicMintPaused, "public mint: paused");
        _;
    }

    modifier whenPublicMintPaused() {
        require(isPublicMintPaused, "public mint: not paused");
        _;
    }

    //////////////////////////////////
    //// Allowlist Mint
    //////////////////////////////////

    bool public isAllowlistMintPaused;

    function pauseAllowlistMint() external onlyOwner whenAllowlistMintNotPaused {
        isAllowlistMintPaused = true;
        emit AllowlistMintPaused();
    }

    function unpauseAllowlistMint() external onlyOwner whenAllowlistMintPaused {
        isAllowlistMintPaused = false;
        emit AllowlistMintUnpaused();
    }

    modifier whenAllowlistMintNotPaused() {
        require(!isAllowlistMintPaused, "allowlist mint: paused");
        _;
    }

    modifier whenAllowlistMintPaused() {
        require(isAllowlistMintPaused, "allowlist mint: not paused");
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
