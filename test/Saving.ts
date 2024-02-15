import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";

  describe("Saving Contract", () => {

    const deploySavingContract = async () => {

        const [owner, otherAccount] = await ethers.getSigners();

        const ZERO_ADDRESS = ethers.ZeroAddress;

        const Saving = await ethers.getContractFactory("SaveEther");

        const saving = await Saving.deploy();

        return {saving, ZERO_ADDRESS, owner, otherAccount}
    }

    describe("Deposit", () => {

         it("should revert if caller is address zero", async () => {
            const {saving, ZERO_ADDRESS, owner} = await loadFixture(deploySavingContract);
            await expect(((await saving.deposit({from: owner, value: 1})).from)).to.not.eql(ZERO_ADDRESS);            
        })

        it("should revert if value is zero", async () => {

            const {saving, ZERO_ADDRESS, owner, otherAccount} = await loadFixture(deploySavingContract);
            await expect((saving.deposit({value: 0}))).to.be.revertedWith("can't save zero value");            
        })

        it("should deposit amount to caller's savings", async () => {
            const {saving, ZERO_ADDRESS, owner} = await loadFixture(deploySavingContract);

            const bal = await saving.checkSavings(owner);

            await saving.connect(owner).deposit({value: 1});

            const newBal = await saving.checkSavings(owner);

            await expect(newBal).to.be.greaterThan(bal);

        })

        describe("Deposit events", () => {
            it("should emit an event after depositing", async () => {
                const {saving, owner} = await loadFixture(deploySavingContract);
                
                await expect(saving.connect(owner).deposit({value: 1})).to.emit(saving, "SavingSuccessful").withArgs(owner, 1);

            })
        })
    })

    describe("Withdraw", () => {

        // it("should revert if caller is address zero", async () => {
        //     const {saving, ZERO_ADDRESS, owner} = await loadFixture(deploySavingContract);
        //     await saving.connect(owner).deposit({value: 1});
        //     expect((await saving.withdraw({from: owner})).from).to.not.be.eql(owner);            
        // })

        it("should withdraw and deduct all balance from caller savings", async () => {
            const {saving, owner} = await loadFixture(deploySavingContract);
            
            await saving.connect(owner).deposit({value: 4});

            const balBeforeWithdrawal = await saving.checkSavings(owner);

            await saving.connect(owner).withdraw()

            const balAfterWithdrawal = await saving.checkSavings(owner);
            
            await expect(balBeforeWithdrawal).to.equal(4);

            await expect(balAfterWithdrawal).to.equal(0);
        })

    })

    describe("sendOutSaving", () => {
        it("should send out specified amount", async () => {

            const {saving, owner, otherAccount} = await loadFixture(deploySavingContract);

            await saving.connect(owner).deposit({value: 4});
            
            await saving.connect(owner).sendOutSaving(otherAccount, 3);

            const balAfterSendingOut = await saving.checkSavings(owner);

            await expect(balAfterSendingOut).to.equal(1);
        })
    })

  })