import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  const { templateId } = params;
  const { searchParams } = new URL(request.url);
  const idempotencyKey = searchParams.get("idempotencyKey");

  if (!idempotencyKey) {
    return NextResponse.json(
      { error: "idempotencyKey is required" },
      { status: 400 }
    );
  }

  // Look up in global mock store
  let deployment = null;
  if (typeof global !== 'undefined') {
    const g = global as any;
    if (g.__mockDeployments && g.__mockDeployments.has(idempotencyKey)) {
      deployment = g.__mockDeployments.get(idempotencyKey);
    }
  }

  if (!deployment) {
    return NextResponse.json(
      { error: "Deployment not found for the provided idempotencyKey" },
      { status: 404 }
    );
  }

  // Calculate elapsed time to simulate progress if not already completed on-chain
  const elapsed = Date.now() - deployment.createdAt;
  let currentStatus: "pending" | "deploying" | "success" = deployment.status;

  if (currentStatus !== "success") {
    if (elapsed > 4000) {
      currentStatus = "success";
    } else if (elapsed > 1500) {
      currentStatus = "deploying";
    }
  }

  // Update status in global store
  deployment.status = currentStatus;
  if (typeof global !== 'undefined') {
    const g = global as any;
    g.__mockDeployments.set(idempotencyKey, deployment);
  }

  return NextResponse.json({
    idempotencyKey: deployment.idempotencyKey,
    templateId: deployment.templateId,
    name: deployment.name,
    symbol: deployment.symbol,
    status: currentStatus,
    txHash: deployment.txHash,
    contractAddress: currentStatus === "success" ? deployment.contractAddress : null,
    progress: currentStatus === "success" ? 100 : currentStatus === "deploying" ? 50 : 10,
    paymasterSponsor: currentStatus === "success" ? {
      sponsored: true,
      paymasterContract: "0x12c019a77dc6dfc3c2b8c5e628a8a49fa7bb12ab",
      policyType: "Circle Gas Station / Arc Gas Abstraction",
      gasSponsoredUSDC: "0.000350 USDC"
    } : null
  });
}
