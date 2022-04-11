const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {
  let manager;
  let accountA;
  let accountB;
  let lottery;
  beforeEach(async () => {
    [manager, accountA, accountB] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy()
    await lottery.deployed()
  })

  describe("enter", function () {
    it("should revert if amount less than 0.01 ether", async function () {
      await expect(lottery.enter({ value: ethers.utils.parseEther("0.001")})).to.be.revertedWith("Lottery: not enough money")      
      expect (await lottery.getTotalMoney()).to.be.equal(ethers.utils.parseEther("0"))
    });
    it("should revert if player already entered", async function () {
      await lottery.enter({ value: ethers.utils.parseEther("1.0")})
      await expect(lottery.enter({ value: ethers.utils.parseEther("1")})).to.be.revertedWith("Lottery: you already joined the Lottery")
    });
    it("allow accounts to enter", async function () {
      await lottery.enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountA).enter({ value: ethers.utils.parseEther("1.0")})
      const bal = await ethers.provider.getBalance(lottery.address)
      console.log(bal)     
      expect (await lottery.getTotalMoney()).to.be.equal(ethers.utils.parseEther("2.0"))
      const players = await lottery.getPlayers()
      assert.equal(players[0], manager.address)
      expect(players[1], accountA.address)
    });
  })
  describe("quit", function () {
    it("should revert if the player has not entered", async function () {
      await expect(lottery.quit()).to.be.revertedWith("Lottery: you have not entered the Lottery")
    });
    it("should quit correctly", async function () {
      await lottery.enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountA).enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountB).enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountA).quit()
      expect (await lottery.getTotalMoney()).to.be.equal(ethers.utils.parseEther("2.0"))
      expect (await lottery.getNumOfPlayer()).to.be.equal(2)
    });
  })
  describe("pick Winner", function () {
    beforeEach(async () => {
      await lottery.enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountA).enter({ value: ethers.utils.parseEther("1.0")})
      await lottery.connect(accountB).enter({ value: ethers.utils.parseEther("1.0")})
    })
    it("should revert if the caller is not the manager", async function () {
      await expect(lottery.connect(accountA).pickWinner()).to.be.revertedWith("Loterry: you are not the manager")
    });
    it("should revert if no one enter the lottery", async function () {
      await lottery.connect(accountA).quit()
      await lottery.connect(accountB).quit()
      await lottery.quit()
      await expect(lottery.pickWinner()).to.be.revertedWith("Lottery: no one join the lottery")
    });
    it("should pick winner correctly", async function () {
      await lottery.pickWinner()
      expect (await lottery.getTotalMoney()).to.be.equal(ethers.utils.parseEther("0"))
      expect (await lottery.getNumOfPlayer()).to.be.equal(0)
    });
  })
})
