defmodule AssetStatusWeb.CheckAssetStatusPlug do
  @moduledoc """
  A plug that does some checks on your asset building status
  """

  @behaviour Plug

  require Logger
  alias Plug.Conn

  def init(opts), do: opts

  def call(%Conn{} = conn, _opts) do
    case File.read("assets/esbuild_build_status") do
      {:ok, "working"} ->
        conn

      {:ok, "building"} ->
        Logger.info("Assets are building")
        conn

      {:ok, "broken\n" <> error_details} ->
        raise "Assets not ready!\n#{error_details}"

      _ ->
        Logger.warning("Asset status unknown")
    end

    conn
  end
end
